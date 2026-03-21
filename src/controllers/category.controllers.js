import mongoose from "mongoose";
import { Category } from "../models/category.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { cacheDel, getWithLock } from "../services/valkey.service.js";
import { CacheKeys } from "../utils/cacheKeys.js";

const createCategory = asyncHandler(async (req, res) => {
    const log = req.log.child({
        module: "category",
        operation: "createCategory",
        userId: req.user._id
    })
    log.info("Create category started")
    const {name, description} = req.body
    if(!name || !name.trim()){
        throw new ApiError(400, "Category name is required")
    }
    const newName = name.trim().toLowerCase()
    const exist = await Category.findOne({name: newName})
    if(exist){
        throw new ApiError(400, "Category already exists")
    }
    const category = await Category.create({name: newName, description: description})

    await cacheDel(CacheKeys.allCategory())
    
    log.info("Category created successfully")
    return res.status(201).json(new ApiResponse(201, category, "Category created successfully"))
})

const updateCategory = asyncHandler(async (req, res) => {
    const log = req.log.child({
        module: "category",
        operation: "updateCategory",
        userId: req.user._id,
        resourceId: req.params.categoryId
    })
    log.info("Update category started")
    const {categoryId} = req.params
    const {name, description} = req.body

    if(!mongoose.Types.ObjectId.isValid(categoryId)){
        throw new ApiError(400, "Invalid Category Id format")
    }

    const updateFields = {}
    const newName = name?.trim()?.toLowerCase()

    if(newName){
        const existingCategory = await Category.findOne({name: newName, _id: {$ne: categoryId}})
        if(existingCategory){
            throw new ApiError(400, "Category name is already taken")
        }
        updateFields.name = newName
    }
    if(description !== undefined){
        updateFields.description = description
    }
    if(Object.keys(updateFields).length === 0){
        throw new ApiError(400, "At least one field (name or description) is required to update")
    }

    const category = await Category.findByIdAndUpdate({_id: categoryId}, {$set: updateFields}, {new: true})
    if(!category){
        throw new ApiError(404, "Category not found")
    }

    await cacheDel(CacheKeys.category(categoryId))
    await cacheDel(CacheKeys.allCategory())
    
    log.info("Category updated successfully")
    return res.status(200).json(new ApiResponse(200, category, "Category updated successfully"))
})

const deleteCategory = asyncHandler(async (req, res) => {
    const log = req.log.child({
        module: "category",
        operation: "deleteCategory",
        userId: req.user._id,
        resourceId: req.params.categoryId
    })
    log.info("Delete category started")
    const {categoryId} = req.params
    if(!mongoose.Types.ObjectId.isValid(categoryId)){
        throw new ApiError(400, "Invalid Category Id format")
    }
    const category = await Category.findByIdAndDelete(categoryId)
    if(!category){
        throw new ApiError(404, "Category not found")
    }

    await cacheDel(CacheKeys.category(categoryId))
    await cacheDel(CacheKeys.allCategory())

    log.info("Category deleted successfully")
    return res.status(200).json(new ApiResponse(200, {}, "Category deleted successfully"))
})

const getAllCategories = asyncHandler(async (req, res) => {
    const log = req.log.child({
        module: "category",
        operation: "getAllCategories",
        userId: req.user?._id
    })
    log.info("Fetch all categories started")
    const categories = await getWithLock(CacheKeys.allCategory(), 60*60*12, () => {
        return Category.find()
    })
    log.info("Categories fetched successfully")
    return res.status(200).json(new ApiResponse(200, categories, "Categories fetched successfully"))
})

const getCategoryById = asyncHandler(async (req, res) => {
    const log = req.log.child({
        module: "category",
        operation: "getCategoryById",
        userId: req.user?._id,
        resourceId: req.params.categoryId
    })
    log.info("Fetch category started")
    const {categoryId} = req.params
    if(!mongoose.Types.ObjectId.isValid(categoryId)){
        throw new ApiError(400, "Invalid Category Id format")
    }

    const category = await getWithLock(CacheKeys.category(categoryId), 60*60*12, () => {
        return Category.findById(categoryId)
    })

    if(!category){
        throw new ApiError(404, "Category not found")
    }
    log.info("Category fetched successfully")
    return res.status(200).json(new ApiResponse(200, category, "Category fetched successfully"))
})

export{
    createCategory,
    updateCategory,
    deleteCategory,
    getAllCategories,
    getCategoryById
}