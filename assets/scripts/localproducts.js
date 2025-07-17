import { departamentosYCiudades } from './red.js';

// Función para crear el modal de selección de ubicación
export function createLocationModal() {
  let modal = document.getElementById('localproModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'localproModal';
    modal.className = 'localpro-modal';
    document.body.appendChild(modal);
  }

  // Generar opciones para departamentos
  const departamentoOptions = Object.keys(departamentosYCiudades)
    .sort()
    .map(departamento => `<option value="${departamento}">${departamento}</option>`)
    .join('');

  modal.innerHTML = `
    <div class="localpro-content">
      <div class="localpro-header">
        <h2>Seleccionar Ubicación</h2>
        <button class="localpro-close" id="localproCloseModal">
          <span class="material-icons">close</span>
        </button>
      </div>
      <div class="localpro-body">
        <div class="localpro-form">
          <label for="localproDepartamentoSelect">Departamento:</label>
          <select id="localproDepartamentoSelect" name="departamento">
            <option value="">Seleccione un departamento</option>
            ${departamentoOptions}
          </select>
          <label for="localproCiudadSelect">Ciudad:</label>
          <select id="localproCiudadSelect" name="ciudad" disabled>
            <option value="">Seleccione una ciudad</option>
          </select>
          <div class="localpro-actions">
            <button id="localproFindButton" class="localpro-find-btn">Find</button>
            <button id="localproViewAllButton" class="localpro-view-all-btn">Ver todos</button>
          </div>
        </div>
      </div>
    </div>
    <style>
      /* Inspired by black-and-white coffee shop aesthetics with a modern, sleek vibe */
.localpro-modal {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  align-items: center;
  justify-content: center;
  font-family: 'Montserrat', sans-serif;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.localpro-modal.open {
  display: flex;
  opacity: 1;
}

.localpro-content {
  background: white;
  padding: 30px;
  border-radius: 8px;
  max-width: 500px;
  width: 90%;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  color: #333;
  transform: translateY(-20px);
  transition: transform 0.3s ease;
}

.localpro-modal.open .localpro-content {
  transform: translateY(0);
}

.localpro-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #eee;
}

.localpro-header h2 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: #000;
}

.localpro-close {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.5rem;
  color: #666;
  transition: color 0.2s ease;
  padding: 5px;
}

.localpro-close:hover {
  color: #000;
}

.localpro-form {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.localpro-form label {
  font-weight: 500;
  color: #000;
  font-size: 0.9rem;
}

.localpro-form select {
  padding: 12px;
  font-size: 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  width: 100%;
  background: white;
  color: #333;
  font-family: 'Montserrat', sans-serif;
  transition: border-color 0.2s ease;
}

.localpro-form select:focus {
  outline: none;
  border-color: #000;
}

.localpro-form select:disabled {
  background: #f5f5f5;
  color: #999;
}

.localpro-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 25px;
}

.localpro-find-btn, .localpro-view-all-btn {
  padding: 10px 20px;
  font-size: 0.9rem;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: 'Montserrat', sans-serif;
  font-weight: 500;
  border: none;
}

.localpro-find-btn {
  background: #000;
  color: white;
}

.localpro-find-btn:hover {
  background: #333;
}

.localpro-view-all-btn {
  background: white;
  color: #000;
  border: 1px solid #ddd;
}

.localpro-view-all-btn:hover {
  background: #f5f5f5;
}

.location-icon {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background: #000;
  color: white;
  border: none;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
  z-index: 1000;
  transition: all 0.2s ease;
}

.location-icon:hover {
  background: #333;
  transform: scale(1.05);
}

.location-icon .material-icons {
  font-size: 24px;
}

@media (max-width: 768px) {
  .localpro-content {
    padding: 20px 15px;
  }
  
  .localpro-actions {
    flex-direction: column;
  }
  
  .localpro-find-btn, .localpro-view-all-btn {
    width: 100%;
  }
  
  .location-icon {
    width: 45px;
    height: 45px;
  }
}
    </style>
  `;

  return modal;
}