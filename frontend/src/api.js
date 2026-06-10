const API_BASE = "/api";

export async function uploadHeadshot(file){
    try {
        const form = new FormData();
        form.append("file", file)

        const res = await fetch(`{API_BASE}/upload-headshot`, {
            method: "POST",
            body: form 
        })

        if(!res.ok){
            throw new Error("Filed to upload headshot")
        }

        return res.json();

    } catch (error) {
        throw new Error("Failed to get responce from AI")
    }
}


export async function createjob({prompt, numThumbnails, headshotUrl}){
    try {
        const res = await fetch(`${API_BASE}/job`, {
            method: "POST",
            headers: {
                "Content-Type" : "application/json",
            },
            body: JSON.stringify({
                prompt,
                num_thumbnails: numThumbnails,
                headshot_url: headshotUrl
            })
        })

        if(!res.ok){
            throw new Error("Failed to create job")
        }

        return res.json();
    } catch (error) {
        throw new Error("Failed to get responce from AI")
    }
}



export async function subscribeToJob(jobId, {onThumnailReady, onThumbnailFailed, onJobComplete, onError}){
    try {
        const es = new EventSource(`${API_BASE}/jobs/${jobId}/stream`);

        es.addEventListener("thumnail_ready", (event)=>{
            onThumnailReady(JSON.parse(event.data));
        })

        es.addEventListener("thumnail_failed", (event)=>{
            onThumbnailFailed(JSON.parse(event.data));
        })

        es.addEventListener("job_complete", (event)=>{
            onJobComplete(JSON.parse(event.data))
            es.close();
        })

        es.addEventListener("error", (event)=>{
            onError(event);
            es.close()
        })

        return es;

    } catch (error) {
        throw new Error("Failed to get responce from AI")
    }
}
