const trackDuration = async (historgram, labels, fun) => {
    const end = historgram.startTimer(labels)
    try {
        return await fun()
    } finally {
        end()
    }
}

export {trackDuration}