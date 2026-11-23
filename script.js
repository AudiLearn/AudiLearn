const fileInput=document.getElementById('fileInput');
const fileName=document.getElementById('fileName');
fileInput.addEventListener('change',()=>{fileName.textContent=fileInput.files.length?`Archivo seleccionado: ${fileInput.files[0].name}`:'Ningún archivo seleccionado';});
document.querySelectorAll('.filter input').forEach(input=>input.addEventListener('change',()=>{
 document.querySelectorAll('.filter').forEach(card=>card.classList.remove('selected'));
 input.closest('.filter').classList.add('selected');
 const labels={jerarquia:'Por relevancia',problema:'Problema-solución',accion:'Por decisiones',temas:'Por categorías'};
 document.getElementById('previewFilter').textContent=labels[input.value];
}));
document.getElementById('depth').addEventListener('change',e=>document.getElementById('previewDepth').textContent=e.target.value);
document.getElementById('duration').addEventListener('change',e=>document.getElementById('previewDuration').textContent=e.target.value);
document.getElementById('prepare').addEventListener('click',()=>{
 const text=document.getElementById('sourceText').value.trim();
 const file=fileInput.files[0];
 if(!text&&!file){alert('Primero selecciona un archivo o pega el contenido de tus apuntes.');return;}
 alert('¡Configuración lista! Esta versión es una demostración visual. En la siguiente etapa conectaremos el análisis con IA y la generación real de audio.');
});
