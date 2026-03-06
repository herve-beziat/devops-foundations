import './style.css'

document.querySelector('#app').innerHTML = `
  <div class="container">
    <h1>DevOps Foundations</h1>
    <p>Frontend minimal pour tester l'API backend.</p>

    <button id="btn-health">Tester l'API /health</button>

    <pre id="output"></pre>
  </div>
`

const btn = document.querySelector('#btn-health')
const output = document.querySelector('#output')

btn.addEventListener('click', async () => {
  output.textContent = "Chargement..."

  try {
    const response = await fetch('api/health')
    const data = await response.json()

    output.textContent = JSON.stringify(data, null, 2)

  } catch (error) {
    output.textContent = "Erreur : impossible de contacter l'API"
  }
})