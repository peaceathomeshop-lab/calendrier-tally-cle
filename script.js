document.addEventListener("DOMContentLoaded", function () {

  // 1. Récupération des éléments du DOM
  const dateListContainer = document.getElementById("date-list") || document.getElementById("selected-dates-summary");
  const hiddenDatesInput = document.getElementById("dates_selectionnees_custom");
  const hiddenSessionInput = document.getElementById("unique_session_id");

  // 2. Récupérer l'ID de session depuis l'URL
  const urlParams = new URLSearchParams(window.location.search);
  const sessionIdFromUrl = urlParams.get("unique_session_id") || urlParams.get("session_id") || "";

  if (hiddenSessionInput && sessionIdFromUrl) {
    hiddenSessionInput.value = sessionIdFromUrl;
  }

  // 3. Calcul de la date d'aujourd'hui et de la limite (+30 jours)
  const today = new Date();
  const maxDateLimit = new Date();
  maxDateLimit.setDate(today.getDate() + 30);

  // 4. Configurer la langue française si disponible
  if (typeof flatpickr !== "undefined" && flatpickr.l10ns && flatpickr.l10ns.fr) {
    flatpickr.localize(flatpickr.l10ns.fr);
  }

  // 5. Recherche du conteneur HTML du calendrier (#inline-calendar ou #date-picker-input)
  const calendarTarget = document.getElementById("inline-calendar") ? "#inline-calendar" : "#date-picker-input";

  // 6. Initialisation UNIQUE de Flatpickr
  flatpickr(calendarTarget, {
    inline: true,              // Calendrier incrusté
    mode: "multiple",          // Sélection multiple
    dateFormat: "Y-m-d",       // Format ISO (YYYY-MM-DD)
    minDate: "today",          // Bloque les dates passées
    maxDate: maxDateLimit,     // Bloque à 30 jours
    locale: "fr",              // Français

    onChange: function (selectedDates, dateStr) {

      // A. Mettre à jour le champ hidden HTML s'il existe
      if (hiddenDatesInput) {
        hiddenDatesInput.value = dateStr;
      }

      // B. Mettre à jour le résumé lisible sous le calendrier
      if (dateListContainer) {
        if (selectedDates.length === 0) {
          dateListContainer.innerHTML = "Aucune date sélectionnée";
        } else {
          const formattedDisplay = selectedDates.map(date => {
            const day = String(date.getDate()).padStart(2, "0");
            const month = String(date.getMonth() + 1).padStart(2, "0");
            const year = date.getFullYear();
            return `${day}/${month}/${year}`;
          });

          dateListContainer.innerHTML = `<strong>${selectedDates.length} date(s) choisie(s) :</strong><br>` + formattedDisplay.join(", ");
        }
      }

      // C. Transmission des données vers Tally (Format officiel API Tally Embed)
      // Format 1 : Protocole officiel Tally Embed
      window.parent.postMessage(
        JSON.stringify({
          key: "setHiddenFields",
          value: {
            dates_selectionnees_custom: dateStr,
            unique_session_id: sessionIdFromUrl
          }
        }),
        "*"
      );

      // Format 2 : Format Objet (Sécurité de secours)
      window.parent.postMessage(
        {
          type: "TALLY_SET_PAYLOAD",
          payload: {
            dates_selectionnees_custom: dateStr,
            unique_session_id: sessionIdFromUrl
          }
        },
        "*"
      );
    }
  });

});
