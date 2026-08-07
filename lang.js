/* ===============================================================
   SELECTOR DE IDIOMA (ES / EN)
   ===============================================================
   Funciona junto con:
   - El <script> sincronico en el <head> de cada pagina, que lee
     localStorage y aplica la clase lang-es/lang-en al <html> ANTES
     de pintar la pagina (evita el flash del idioma equivocado).
   - Las reglas CSS en styles.css que muestran/ocultan los elementos
     con [data-lang="es"] / [data-lang="en"] segun esa clase.
   Este archivo solo se encarga de la logica del BOTON: cambiar la
   clase al hacer click y guardar la eleccion para que persista en
   las demas paginas del sitio. */
function ytToggleLang() {
  var html = document.documentElement;
  var isEn = html.classList.contains('lang-en');
  html.classList.remove('lang-en', 'lang-es');
  var newLang = isEn ? 'es' : 'en';
  html.classList.add('lang-' + newLang);
  localStorage.setItem('ytml-lang', newLang);
}
