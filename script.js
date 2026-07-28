const WHATSAPP_NUMBER = "6590000000"; // Replace with your business WhatsApp number, digits only.

const menuBtn = document.getElementById("menuBtn");
const navMenu = document.getElementById("navMenu");
menuBtn.addEventListener("click", () => navMenu.classList.toggle("open"));
navMenu.querySelectorAll("a").forEach(a => a.addEventListener("click", () => navMenu.classList.remove("open")));

document.querySelectorAll("[data-package]").forEach(link => {
  link.addEventListener("click", () => {
    document.getElementById("service").value = link.dataset.package;
  });
});

document.getElementById("year").textContent = new Date().getFullYear();

const dateInput = document.getElementById("date");
dateInput.min = new Date().toISOString().split("T")[0];

document.getElementById("bookingForm").addEventListener("submit", function (event) {
  event.preventDefault();

  const data = {
    service: document.getElementById("service").value,
    date: document.getElementById("date").value,
    time: document.getElementById("time").value,
    pickup: document.getElementById("pickup").value.trim(),
    destination: document.getElementById("destination").value.trim(),
    passengers: document.getElementById("passengers").value,
    luggage: document.getElementById("luggage").value,
    name: document.getElementById("name").value.trim(),
    contact: document.getElementById("contact").value.trim(),
    remarks: document.getElementById("remarks").value.trim() || "None"
  };

  const message =
`A3 GROUP SG – NEW BOOKING REQUEST

Service: ${data.service}
Pickup date: ${data.date}
Pickup time: ${data.time}
Pickup location: ${data.pickup}
Destination / itinerary: ${data.destination}

Passengers: ${data.passengers}
Luggage: ${data.luggage}
Customer name: ${data.name}
Contact number: ${data.contact}
Flight / remarks: ${data.remarks}

Please provide availability and quotation.`;

  const url = `https://wa.me/${6584849004}?text=${encodeURIComponent(message)}`;
  window.open(url, "_blank", "noopener,noreferrer");
});
