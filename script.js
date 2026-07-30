// 1. Récupération des éléments du DOM (champs HTML)
  const dateListContainer = document.getElementById("date-list");
  const hiddenDatesInput = document.getElementById("dates_selectionnees_custom");
  const hiddenSessionInput = document.getElementById("unique_session_id");

  // 2. Récupérer l'ID de session depuis l'URL (si transmis par Tally/iFrame)
  const urlParams = new URLSearchParams(window.location.search);
  const sessionIdFromUrl = urlParams.get("unique_session_id") || urlParams.get("session_id") || "";

  if (hiddenSessionInput && sessionIdFromUrl) {
    hiddenSessionInput.value = sessionIdFromUrl;
  }

  // 3. Calcul de la date d'aujourd'hui et de la date limite (+30 jours)
  const today = new Date();
  const maxDateLimit = new Date();
  maxDateLimit.setDate(today.getDate() + 30);

  // 4. Initialisation du calendrier Flatpickr
  flatpickr("#inline-calendar", {
    inline: true,              // Affiche le calendrier directement sur la page
    mode: "multiple",          // Permet la sélection de plusieurs dates
    dateFormat: "Y-m-d",       // Format standard ISO (YYYY-MM-DD) idéal pour Make/Tally
    minDate: "today",          // Empêche la sélection de dates passées
    maxDate: maxDateLimit,     // Limite à 30 jours dans le futur
    locale: "fr",              // Calendrier en français

    // Fonction déclenchée à chaque clic / modification de sélection
    onChange: function (selectedDates, dateStr, instance) {

      // A. Mettre à jour le champ caché avec les dates séparées par une virgule (ex: "2026-08-01, 2026-08-05")
      if (hiddenDatesInput) {
        hiddenDatesInput.value = dateStr;
      }

      // B. Mettre à jour le résumé lisible sous le calendrier
      if (selectedDates.length === 0) {
        dateListContainer.innerHTML = "Aucune date sélectionnée";
      } else {
        // Formater les dates joliment pour l'affichage (ex: 01/08/2026)
        const formattedDisplay = selectedDates.map(date => {
          const day = String(date.getDate()).padStart(2, "0");
          const month = String(date.getMonth() + 1).padStart(2, "0");
          const year = date.getFullYear();
          return `${day}/${month}/${year}`;
        });

        dateListContainer.innerHTML = formattedDisplay.join(", ");
      }

      // C. Envoyer un message en temps réel à Tally/la page parente (si intégré en iFrame)
      window.parent.postMessage({
        type: "calendar_update",
        dates: dateStr,
        sessionId: hiddenSessionInput ? hiddenSessionInput.value : ""
      }, "*");
    }
  });

});
