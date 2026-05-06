const MODEL_VERSION = 'stability-ai/stable-diffusion:db21e45d3f7023abc2a46ee38a23973f6dce16bb0f966fff8ad386f1eeef5e67'

function buildPrompt(keyword: string): string {
  return `cartoon hippo meme character, ugly cute style, asymmetric eyes, thick black outlines, flat color blocks, Family Guy simple art style, funny expression, white background, the hippo is reacting to: ${keyword}`
}

export async function generateMemeImage(keyword: string): Promise<string> {
  const token = import.meta.env.VITE_REPLICATE_API_TOKEN

  if (!token) {
    const encoded = encodeURIComponent(keyword.slice(0, 20))
    return `https://placehold.co/512x512/1a1a2e/9b59b6?text=HIPPO%0A${encoded}&font=sans-serif`
  }

  const prompt = buildPrompt(keyword)

  const createRes = await fetch('https://api.replicate.com/v1/predictions', {
    method: 'POST',
    headers: {
      'Authorization': `Token ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      version: MODEL_VERSION,
      input: {
        prompt,
        width: 512,
        height: 512,
        num_outputs: 1,
        num_inference_steps: 20,
        guidance_scale: 7.5,
      },
    }),
  })

  if (!createRes.ok) {
    const err = await createRes.text()
    throw new Error(`Replicate API error: ${err}`)
  }

  const prediction = await createRes.json() as { id: string }
  const predictionId = prediction.id

  for (let i = 0; i < 60; i++) {
    await new Promise(r => setTimeout(r, 2000))
    const pollRes = await fetch(`https://api.replicate.com/v1/predictions/${predictionId}`, {
      headers: { 'Authorization': `Token ${token}` },
    })
    const result = await pollRes.json() as { status: string; output?: string[]; error?: string }

    if (result.status === 'succeeded' && result.output) {
      return result.output[0]
    } else if (result.status === 'failed' || result.status === 'canceled') {
      throw new Error(`Generation failed: ${result.error ?? 'unknown error'}`)
    }
  }

  throw new Error('Generation timed out after 120 seconds')
}
