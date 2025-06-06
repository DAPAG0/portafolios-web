// Tradução para o português

document.addEventListener('DOMContentLoaded', function () {
  // FORMULÁRIO DEMO
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
      alert('Por favor, insira um email válido.');
      return;
    }

    const fecha = new Date().toLocaleString();
    fechaInput.value = fecha;

    const fileInput = document.getElementById('pdf');
    const file = fileInput.files[0];

    if (!file) {
      alert('Por favor, envie um arquivo PDF.');
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
        console.log('Resposta:', text);
        alert('Formulário enviado com sucesso');

        form.reset();
        modal.style.display = 'none';
      } catch (error) {
        console.error('Erro ao enviar o formulário', error);
        alert('Ocorreu um erro ao enviar o formulário');
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

  // VISUALIZAR DESIGNS
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

  // BUSCA DE DESIGNS
  const buscarForm = document.getElementById('buscar-form');
  const resultados = document.getElementById('resultados');
  const apiURL = 'https://script.google.com/macros/s/AKfycbwMisssILfMHx6udXI0DxNBQBd8Z7szfu-J3Ew0a7dIBTyY5g0Pu8nBa9GC8vZPxAXMmw/exec';
  const decisionURL = 'https://script.google.com/macros/s/AKfycbwUT6GBDU6S3LV50mOopcHG_K6zuPcRJQcItPXzcUwcApmXBpFFhcTOQttQ_NLyTYGi-A/exec';

  if (buscarForm && resultados) {
    buscarForm.addEventListener('submit', async function (e) {
      e.preventDefault();

      const email = document.getElementById('emailCliente').value.trim();
      if (!email) {
        alert("Por favor, insira um endereço de email válido.");
        return;
      }

      resultados.innerHTML = "<p>Buscando designs...</p>";
      resultados.style.display = 'block';

      try {
        const response = await fetch(`${apiURL}?email=${encodeURIComponent(email)}`);
        const files = await response.json();

        if (!files.length) {
          resultados.innerHTML = "<p>Nenhum design pendente no momento.</p>";
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
              <label for="approved-${index}">Aprovado</label>

              <input type="radio" id="rejected-${index}" name="estado-${index}" value="rechazado" />
              <label for="rejected-${index}">Rejeitado</label>
            </div>

            <textarea name="comment-${index}" rows="3" placeholder="Comentário opcional..."></textarea>
          `;

          resultados.appendChild(container);
        });

        const confirmBtn = document.createElement('button');
        confirmBtn.textContent = "Confirmar seleção";
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
            alert("Você deve selecionar pelo menos um design para aprovar ou rejeitar.");
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
            resultados.innerHTML = "<p>Respostas enviadas com sucesso.</p>";
          } catch (err) {
            console.error(err);
            alert("Erro ao enviar as respostas.");
          }
        });

        resultados.appendChild(confirmBtn);
      } catch (error) {
        console.error(error);
        resultados.innerHTML = "<p>Erro ao buscar designs. Por favor, tente novamente mais tarde.</p>";
      }
    });
  }
});
