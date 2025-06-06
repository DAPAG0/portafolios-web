document.addEventListener('DOMContentLoaded', function () {
  // ----------------------------
  // FORMULARIO DEMO
  // ----------------------------
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
      alert('Por favor, introduce un email válido.');
      return;
    }

    const fecha = new Date().toLocaleString();
    fechaInput.value = fecha;

    const fileInput = document.getElementById('pdf');
    const file = fileInput.files[0];

    if (!file) {
      alert('Por favor, sube un archivo PDF.');
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
        console.log('Respuesta:', text);
        alert('Formulario enviado con éxito');

        form.reset();
        modal.style.display = 'none';
      } catch (error) {
        console.error('Error al enviar el formulario', error);
        alert('Hubo un error al enviar el formulario');
      }
    };

    reader.readAsDataURL(file);
  });

  // ----------------------------
  // TOOLTIP MULTIPLES
  // ----------------------------
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

  // ----------------------------
  // FORMULARIO VISUALIZAR DISEÑOS
  // ----------------------------
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

  // ----------------------------
  // BUSQUEDA DE DISEÑOS POR CORREO
  // ----------------------------
  const buscarForm = document.getElementById('buscar-form');
  const resultados = document.getElementById('resultados');
  const apiURL = 'https://script.google.com/macros/s/AKfycbwMisssILfMHx6udXI0DxNBQBd8Z7szfu-J3Ew0a7dIBTyY5g0Pu8nBa9GC8vZPxAXMmw/exec';
  const decisionURL = 'https://script.google.com/macros/s/AKfycbwUT6GBDU6S3LV50mOopcHG_K6zuPcRJQcItPXzcUwcApmXBpFFhcTOQttQ_NLyTYGi-A/exec';

  if (buscarForm && resultados) {
    buscarForm.addEventListener('submit', async function (e) {
      e.preventDefault();

      const email = document.getElementById('emailCliente').value.trim();
      if (!email) {
        alert("Introduce un correo electrónico válido.");
        return;
      }

      resultados.innerHTML = "<p>Buscando diseños...</p>";
      resultados.style.display = 'block';

      try {
        const response = await fetch(`${apiURL}?email=${encodeURIComponent(email)}`);
        const files = await response.json();

        if (!files.length) {
          resultados.innerHTML = "<p>No hay diseños pendientes por el momento.</p>";
          return;
        }

        resultados.innerHTML = ""; // limpiar

        files.forEach((file, index) => {
          const container = document.createElement('div');
          container.className = 'pdf-entry';
          const nombreLimpio = file.name.includes('|') ? file.name.split('|')[1] : file.name;
          container.innerHTML = `
            <p><a href="${file.url}" target="_blank">${nombreLimpio}</a></p>

            <div class="options">
              <input type="radio" id="aprobado-${index}" name="estado-${index}" value="aprobado" />
              <label for="aprobado-${index}">Aprobado</label>

              <input type="radio" id="rechazado-${index}" name="estado-${index}" value="rechazado" />
              <label for="rechazado-${index}">Rechazado</label>
            </div>

            <textarea name="comentario-${index}" rows="3" placeholder="Comentario opcional..."></textarea>
          `;

          resultados.appendChild(container);
        });

        // Botón de confirmar
        const confirmarBtn = document.createElement('button');
        confirmarBtn.textContent = "Confirmar selección";
        confirmarBtn.className = "cta-alt";
        confirmarBtn.style.marginTop = "1rem";

        confirmarBtn.addEventListener('click', async () => {
          const decisiones = [];

          files.forEach((file, i) => {
            const estado = document.querySelector(`input[name="estado-${i}"]:checked`);
            const comentario = document.querySelector(`textarea[name="comentario-${i}"]`).value;

            if (estado) {
              decisiones.push({
                nombreArchivo: file.name,
                url: file.url,
                estado: estado.value,
                comentario: comentario
              });
            }
          });

          if (decisiones.length === 0) {
            alert("Debes seleccionar al menos un diseño para aprobar o rechazar.");
            return;
          }

          try {
            const res = await fetch(decisionURL, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(decisiones)
            });

            const result = await res.text();
            alert(result);
            resultados.innerHTML = "<p>Respuestas enviadas con éxito.</p>";
          } catch (err) {
            console.error(err);
            alert("Error al enviar las respuestas.");
          }
        });

        resultados.appendChild(confirmarBtn);

      } catch (error) {
        console.error(error);
        resultados.innerHTML = "<p>Error al consultar los diseños. Intenta de nuevo más tarde.</p>";
      }
    });
  }
});
