
export type AlumnoType = {
    nombre: string;
    apellido: string;
}

export class Alumno {
    protected nombre: string;
    protected apellido: string;

    constructor({ nombre, apellido }: AlumnoType) {
        this.nombre = nombre;
        this.apellido = apellido;
    }

    getNombre() {
        return this.nombre;
    }
    setNombre(nuevoNombre: string) {
        this.nombre = nuevoNombre;
    }
}


class Persona {

}
