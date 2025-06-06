// Traducción al inglés
document.addEventListener('DOMContentLoaded', function () {
  // FORMULARIO DEMO
  const openBtn = document.getElementById('open-form-btn');
  const modal = document.getElementById('demo-form-modal');
  const closeBtn = document.getElementById('close-form-btn');
  const form = document.getElementById('demo-form');
  const fechaInput = document.getElementById('fecha-envio');
  const scriptURL = 'https://script.google.com/macros/s/AKfycbzYtGxzXB5eVz4cJRGl64J5Ltl9lTUcJFwG8Qp4eTumUvFAmzw4z9fVgDDMNBRmEwwFUA/exec';

  openBtn.addEventListener('click', () => {
    modal.style.display = 'block';
  });

  closeBtn.addEventListener('click', () => {
    modal.style.display = 'none';
  });

  window.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.style.display = 'none';
    }
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = form.email.value;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert('Please enter a valid email.');
      return;
    }

    const fecha = new Date().toLocaleString();
    fechaInput.value = fecha;

    const fileInput = document.getElementById('pdf');
    const file = fileInput.files[0];

    if (!file) {
      alert('Please upload a PDF file.');
      return;
    }

    const nombreArchivoInput = document.getElementById('nombreArchivo');
    nombreArchivoInput.value = file.name;

    const reader = new FileReader();

    reader.onload = async function () {
      const base64PDF = reader.result;

      const formData = new FormData(form);
      formData.append('fecha', fecha);
      formData.append('pdf', base64PDF);

      try {
        const response = await fetch(scriptURL, {
          method: 'POST',
          body: formData
        });

        const text = await response.text();
        console.log('Response:', text);
        alert('Form submitted successfully');

        form.reset();
        modal.style.display = 'none';
      } catch (error) {
        console.error('Error submitting form', error);
        alert('An error occurred while submitting the form');
      }
    };

    reader.readAsDataURL(file);
  });

  // TOOLTIP
  const triggers = document.querySelectorAll('.tooltip-trigger');
  let timeoutId;

  triggers.forEach(trigger => {
    const tooltipId = trigger.dataset.tooltipId;
    const tooltip = document.getElementById(tooltipId);

    trigger.addEventListener('mouseenter', () => {
      timeoutId = setTimeout(() => {
        const rect = trigger.getBoundingClientRect();
        tooltip.style.top = `${window.scrollY + rect.bottom + 10}px`;
        tooltip.style.left = `${rect.left}px`;
        tooltip.classList.add('visible');
      }, 1000);
    });

    trigger.addEventListener('mouseleave', () => {
      clearTimeout(timeoutId);
      tooltip.classList.remove('visible');
    });
  });

  // VISUALIZAR DISEÑOS
  const visualizarBtn = document.getElementById('open-visualizar-btn');
  const visualizarModal = document.getElementById('visualizar-form-modal');
  const closeVisualizarBtn = document.getElementById('close-visualizar-btn');

  if (visualizarBtn && visualizarModal && closeVisualizarBtn) {
    visualizarBtn.addEventListener('click', (e) => {
      e.preventDefault();
      visualizarModal.style.display = 'block';
    });

    closeVisualizarBtn.addEventListener('click', () => {
      visualizarModal.style.display = 'none';
    });

    window.addEventListener('click', (e) => {
      if (e.target === visualizarModal) {
        visualizarModal.style.display = 'none';
      }
    });
  }

  // BÚSQUEDA DE DISEÑOS
  const buscarForm = document.getElementById('buscar-form');
  const resultados = document.getElementById('resultados');
  const apiURL = 'https://script.google.com/macros/s/AKfycbwMisssILfMHx6udXI0DxNBQBd8Z7szfu-J3Ew0a7dIBTyY5g0Pu8nBa9GC8vZPxAXMmw/exec';
  const decisionURL = 'https://script.google.com/macros/s/AKfycbwUT6GBDU6S3LV50mOopcHG_K6zuPcRJQcItPXzcUwcApmXBpFFhcTOQttQ_NLyTYGi-A/exec';

  if (buscarForm && resultados) {
    buscarForm.addEventListener('submit', async function (e) {
      e.preventDefault();

      const email = document.getElementById('emailCliente').value.trim();
      if (!email) {
        alert("Please enter a valid email address.");
        return;
      }

      resultados.innerHTML = "<p>Searching for designs...</p>";
      resultados.style.display = 'block';

      try {
        const response = await fetch(`${apiURL}?email=${encodeURIComponent(email)}`);
        const files = await response.json();

        if (!files.length) {
          resultados.innerHTML = "<p>No designs pending at this time.</p>";
          return;
        }

        resultados.innerHTML = "";

        files.forEach((file, index) => {
          const container = document.createElement('div');
          container.className = 'pdf-entry';
          const cleanName = file.name.includes('|') ? file.name.split('|')[1] : file.name;
          container.innerHTML = `
            <p><a href="${file.url}" target="_blank">${cleanName}</a></p>

            <div class="options">
              <input type="radio" id="approved-${index}" name="estado-${index}" value="aprobado" />
              <label for="approved-${index}">Approved</label>

              <input type="radio" id="rejected-${index}" name="estado-${index}" value="rechazado" />
              <label for="rejected-${index}">Rejected</label>
            </div>

            <textarea name="comment-${index}" rows="3" placeholder="Optional comment..."></textarea>
          `;

          resultados.appendChild(container);
        });

        const confirmBtn = document.createElement('button');
        confirmBtn.textContent = "Confirm selection";
        confirmBtn.className = "cta-alt";
        confirmBtn.style.marginTop = "1rem";

        confirmBtn.addEventListener('click', async () => {
          const decisions = [];

          files.forEach((file, i) => {
            const state = document.querySelector(`input[name="estado-${i}"]:checked`);
            const comment = document.querySelector(`textarea[name="comment-${i}"]`).value;

            if (state) {
              decisions.push({
                nombreArchivo: file.name,
                url: file.url,
                estado: state.value,
                comentario: comment
              });
            }
          });

          if (decisions.length === 0) {
            alert("You must select at least one design to approve or reject.");
            return;
          }

          try {
            const res = await fetch(decisionURL, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(decisions)
            });

            const result = await res.text();
            alert(result);
            resultados.innerHTML = "<p>Responses sent successfully.</p>";
          } catch (err) {
            console.error(err);
            alert("Error sending responses.");
          }
        });

        resultados.appendChild(confirmBtn);
      } catch (error) {
        console.error(error);
        resultados.innerHTML = "<p>Error fetching designs. Please try again later.</p>";
      }
    });
  }
});