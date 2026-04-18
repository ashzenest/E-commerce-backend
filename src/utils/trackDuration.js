const trackDuration = async (historgram, labels, fun) => {
    const end = historgram.startTimer(labels)
    let status = "success"
    try {
        return await fun()
    } catch(err){
        status = "failed"
        throw err
    } finally {
        end({status})
    }
}

export {trackDuration}