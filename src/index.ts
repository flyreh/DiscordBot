import { Alumno } from "./awd";

interface Drink {
    name: string;
}

interface AlcoholicDrink extends Drink {
    alcohol: number;

    showInfo(): string;
}

interface MixedDrink {
    ingredients: string[];
}

class Wine {
    alcohol: number;
    name: string;
    hola: string;

    constructor(name: string, alcohol: number, hola: string) {
        this.name = name;
        this.alcohol = alcohol;
        this.hola = hola;
    }

    showInfo(): string {
        return `info: ${this.name} ${this.alcohol}`;
    }
}

class Cooktail implements AlcoholicDrink, MixedDrink {
    alcohol: number;
    name: string;
    ingredients: string[];

    constructor(name: string, alcohol: number, ingredients: string[]) {
        this.name = name;
        this.alcohol = alcohol;
        this.ingredients = ingredients;
    }

    showInfo(): string {
        const ingredientsInfo = this.ingredients.reduce(
            (acumulator, element) => acumulator + " " + element + ", ", "");
        return `info: ${this.name} ${this.alcohol} ingredients: ${ingredientsInfo}`;
    }
}

const margarita = new Cooktail("Margarita", 12.5, ["tequila", "limon", "sal", "soda", "hielo"]);
const rioja = new Wine("Vino Rioja", 14, "hola");
const malbec = new Wine("Vino Malbec", 16, "hola");

const ad: AlcoholicDrink[] = [
    margarita, rioja, malbec
]

function showDrinks(drinks: AlcoholicDrink[]): void {
    drinks.forEach(e => console.log(e.showInfo()));
}

showDrinks(ad);

class Ventilador {

    private nombre: string;
    private marca: string;
    private ejes: number;

    constructor(nombre: string, marca: string, ejes: number) {
        this.nombre = nombre;
        this.marca = marca;
        this.ejes = ejes;
    }

    getPrecio(): number {
        return this.ejes * 100;
    }
    metodoPadre(): string {
        return "metodoPadre";
    }

}

class miniVentilador extends Ventilador {

    private color: string;
    private ejesBajo: number;

    constructor(nombre: string, marca: string, ejes: number, color: string, ejesBajo: number) {
        super(nombre, marca, ejes);
        this.color = color;
        this.ejesBajo = ejesBajo;
    }

    override getPrecio(): number {
        const precioMayor = super.getPrecio();
        return this.ejesBajo * 100 + precioMayor;
    }

    metodo(): string {
        return "metodo hijo";
    }

}

const ventilador: Ventilador = new miniVentilador("Ventilador", "Marca", 5, "Rojo", 2);
console.log(ventilador.getPrecio());

console.log(ventilador.metodoPadre());
// dowcasting
const ventilador2 = ventilador as miniVentilador;
console.log(ventilador2.metodo());

