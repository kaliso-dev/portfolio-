document.addEventListener('DOMContentLoaded', () => {
    const burgerMenu = document.querySelector('.burger-menu');
    const pages = document.querySelector('.pages');

    burgerMenu.addEventListener('click', () => {
        pages.classList.toggle('active');
    });

    // Fermer le menu burger lorsque l'utilisateur clique en dehors
    document.addEventListener('click', (event) => {
        if (!burgerMenu.contains(event.target) && !pages.contains(event.target)) {
            pages.classList.remove('active');
        }
    });
});

document.addEventListener("DOMContentLoaded", function () {
    const textElement = document.getElementById("typing-text");
    const text = textElement.innerHTML.trim();
    textElement.innerHTML = "";
    let index = 0;
  
    function typeWriter() {
      if (index < text.length) {
        textElement.innerHTML += text.charAt(index);
        index++;
        setTimeout(typeWriter, 50); // Ajustez la vitesse de frappe ici
      } else {
        // Une fois terminé, supprimer la barre d'écriture
        textElement.classList.add("typing-complete");
      }
    }
  
    window.addEventListener('scroll', () => {
      const rect = textElement.getBoundingClientRect();
      if (rect.top >= 0 && rect.bottom <= window.innerHeight) {
        if (index === 0) { // Pour éviter de relancer l'effet à chaque scroll
          typeWriter();
        }
      }
    });
  });
  
  
  
  