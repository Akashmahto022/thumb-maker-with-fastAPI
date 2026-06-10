import { useMemo, useState } from 'react'
import { createJob, subscribeToJob, uploadHeadshot } from './api'
import './App.css'

const examples = [
  'AI coding tools that actually save developers 10 hours a week',
  'I tested the fastest laptops for creators in 2026',
  'Build a SaaS dashboard with FastAPI and React from scratch',
]

const styleLabels = {
  bold_dramatic: 'Bold dramatic',
  clean_minimal: 'Clean minimal',
  vibrant_energetic: 'Vibrant energetic',
}

function App() {
  const [file, setFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState('')
  const [prompt, setPrompt] = useState(examples[0])
  const [numThumbnails, setNumThumbnails] = useState(3)
  const [headshotUrl, setHeadshotUrl] = useState('')
  const [jobId, setJobId] = useState('')
  const [status, setStatus] = useState('Idle')
  const [results, setResults] = useState([])
  const [errors, setErrors] = useState([])
  const [isRunning, setIsRunning] = useState(false)

  const canGenerate = useMemo(() => {
    return prompt.trim().length > 5 && file && !isRunning
  }, [file, isRunning, prompt])

  function handleFileChange(event) {
    const selected = event.target.files?.[0]
    setFile(selected || null)
    setHeadshotUrl('')
    setErrors([])

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
    }

    setPreviewUrl(selected ? URL.createObjectURL(selected) : '')
  }

  async function handleGenerate(event) {
    event.preventDefault()

    if (!file) {
      setErrors(['Upload a headshot before starting generation.'])
      return
    }

    setIsRunning(true)
    setResults([])
    setErrors([])
    setJobId('')
    setStatus('Uploading headshot')

    try {
      const upload = await uploadHeadshot(file)
      setHeadshotUrl(upload.url)
      setStatus('Creating generation job')

      const job = await createJob({
        prompt: prompt.trim(),
        numThumbnails,
        headshotUrl: upload.url,
      })

      setJobId(job.job_id)
      setStatus('Generating thumbnails')

      subscribeToJob(job.job_id, {
        onThumbnailReady: (thumbnail) => {
          setResults((current) => [...current, thumbnail])
        },
        onThumbnailFailed: (thumbnail) => {
          setErrors((current) => [
            ...current,
            `${styleLabels[thumbnail.style_name] || thumbnail.style_name}: ${
              thumbnail.error || 'Generation failed'
            }`,
          ])
        },
        onJobComplete: () => {
          setStatus('Completed')
          setIsRunning(false)
        },
        onError: () => {
          setStatus('Connection stopped')
          setIsRunning(false)
          setErrors((current) => [
            ...current,
            'The live generation stream closed unexpectedly.',
          ])
        },
      })
    } catch (error) {
      setStatus('Ready')
      setIsRunning(false)
      setErrors([error.message])
    }
  }

  return (
    <main className="app-shell">
      <section className="workspace">
        <div className="intro">
          <div className="brand-row">
            <span className="brand-mark">TM</span>
            <span>Thumb Maker AI</span>
          </div>
          <h1>Generate tech thumbnails from one headshot and one idea.</h1>
          <p>
            Upload your face, describe the video, and let the FastAPI backend
            create YouTube-ready thumbnail concepts in multiple styles.
          </p>
          <div className="metrics">
            <span>FastAPI</span>
            <span>React</span>
            <span>Image AI</span>
          </div>
        </div>

        <form className="control-panel" onSubmit={handleGenerate}>
          <label className="upload-zone">
            <input type="file" accept="image/*" onChange={handleFileChange} />
            {previewUrl ? (
              <img src={previewUrl} alt="Selected headshot preview" />
            ) : (
              <span>Drop or choose a headshot</span>
            )}
          </label>

          <label className="field">
            <span>Video idea</span>
            <textarea
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              rows="5"
              placeholder="Describe the video topic, emotion, and audience"
            />
          </label>

          <div className="quick-prompts">
            {examples.map((example) => (
              <button
                key={example}
                type="button"
                onClick={() => setPrompt(example)}
              >
                {example}
              </button>
            ))}
          </div>

          <label className="field compact">
            <span>Variations</span>
            <select
              value={numThumbnails}
              onChange={(event) => setNumThumbnails(Number(event.target.value))}
            >
              <option value="1">1 thumbnail</option>
              <option value="2">2 thumbnails</option>
              <option value="3">3 thumbnails</option>
            </select>
          </label>

          <button className="primary-action" type="submit" disabled={!canGenerate}>
            {isRunning ? 'Generating...' : 'Generate thumbnails'}
          </button>
        </form>
      </section>

      <section className="status-strip" aria-live="polite">
        <div>
          <span className="label">Status</span>
          <strong>{status}</strong>
        </div>
        <div>
          <span className="label">Job ID</span>
          <strong>{jobId || 'Not started'}</strong>
        </div>
        <div>
          <span className="label">Headshot</span>
          <strong>{headshotUrl ? 'Uploaded' : 'Waiting'}</strong>
        </div>
      </section>

      {errors.length > 0 && (
        <section className="alert-list">
          {errors.map((error) => (
            <p key={error}>{error}</p>
          ))}
        </section>
      )}

      <section className="results-grid">
        {results.length === 0 ? (
          Array.from({ length: numThumbnails }).map((_, index) => (
            <article className="result-card placeholder" key={index}>
              <div className="thumbnail-skeleton">
                <span>{isRunning ? 'Rendering' : 'Preview'}</span>
              </div>
              <h2>{['Bold dramatic', 'Clean minimal', 'Vibrant energetic'][index]}</h2>
              <p>
                {isRunning
                  ? 'The backend is working on this concept.'
                  : 'Generated results will appear here.'}
              </p>
            </article>
          ))
        ) : (
          results.map((thumb) => (
            <article className="result-card" key={thumb.thumbnail_id}>
              <img
                src={thumb.imagekit_url || thumb.imageKit_url}
                alt={`${styleLabels[thumb.style_name] || thumb.style_name} thumbnail`}
              />
              <div className="result-body">
                <h2>{styleLabels[thumb.style_name] || thumb.style_name}</h2>
                <div className="download-row">
                  {thumb.variants &&
                    Object.entries(thumb.variants).map(([name, url]) => (
                      <a key={name} href={url} target="_blank">
                        {name}
                      </a>
                    ))}
                </div>
              </div>
            </article>
          ))
        )}
      </section>
    </main>
  )
}

export default App
