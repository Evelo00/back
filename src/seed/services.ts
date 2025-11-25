import Service from "../models/service";

export async function seedServices() {
  const services = [
    { nombre: "KIDS ESPECIAL", precio: 30000, duracion: 45 },
    { nombre: "CORTE KIDS", precio: 25000, duracion: 30 },
    { nombre: "CORTE BASICO", precio: 30000, duracion: 30 },
    { nombre: "BARBA", precio: 25000, duracion: 25 },
    { nombre: "BASICO + BARBA", precio: 50000, duracion: 50 },
    { nombre: "FACIAL", precio: 50000, duracion: 40 },
    { nombre: "CORTE BASICO + FACIAL", precio: 80000, duracion: 60 },
    { nombre: "CORTE BASICO + BARBA + FACIAL", precio: 100000, duracion: 80 },
    { nombre: "CEJAS BASICO", precio: 15000, duracion: 15 },
    { nombre: "CEJAS SEMI", precio: 30000, duracion: 20 },
    { nombre: "TINTE BARBA", precio: 40000, duracion: 30 },
    { nombre: "TINTE CABELLO", precio: 60000, duracion: 40 },
    { nombre: "CERA NARIZ", precio: 10000, duracion: 10 },
    { nombre: "CERA OIDOS", precio: 10000, duracion: 10 },
    { nombre: "CERA NARIZ + OIDO", precio: 20000, duracion: 15 },
    { nombre: "BARBA + FACIAL", precio: 75000, duracion: 50 },
    { nombre: "CORTE CON TIJERA", precio: 40000, duracion: 40 },
    { nombre: "CERQUILLOS", precio: 10000, duracion: 10 },
    { nombre: "CORTE TIJERA + FACIAL", precio: 90000, duracion: 70 },
  ];

  for (const s of services) {
    await Service.findOrCreate({
      where: { nombre: s.nombre }, // evita duplicados
      defaults: s,
    });
  }

  console.log("Servicios cargados correctamente!");
}

seedServices().catch(console.error);