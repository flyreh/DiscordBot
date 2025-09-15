import { escapeCodeBlock, Interaction, SlashCommandBuilder, Client } from "discord.js";
import { Command, ObjectWord } from "../../types";


let currentWord: string = '';
let currentDate: string  = '';
let wordGuessed: boolean = false;

export let word = new SlashCommandBuilder()
    .setName("palabra")
    .setDescription("Palabra del día")
    .addStringOption((string)=>
        string
        .setName("palabra")
        .setDescription("Palabra del día")
        .setRequired(true)

    );
    export async function execute({ client, interaction }: {client : Client<boolean>, interaction: any}) {
        const today = new Date().toISOString().split('T')[0]; // Obtener la fecha actual en formato YYYY-MM-DD
    
        if (currentDate !== today) {
            currentDate = today;
            wordGuessed = false;
    
            try {
                const response = await fetch(`https://random-word-api.herokuapp.com/word?number=1&length=6`);
                if (!response.ok) {
                    throw new Error(`Response status: ${response.status}`);
                }
    
                const jsonword = await response.json();
                currentWord = jsonword[0];
            } catch (error) {
                console.error(error);
                await interaction.reply({
                    content: "Hubo un error al obtener la palabra del día.",
                });
                return;
            }
        }
    
        if (wordGuessed) {
            return await interaction.reply({
                content: `La palabra del día ya ha sido adivinada. Vuelve mañana para una nueva palabra.`,
            });

        }
    
        const ArrayWrite: string[] = interaction.options.getString("palabra").split("");
        const ArrayWord: string[] = currentWord.split("");

        if (!ArrayWrite) {
            await interaction.reply({
                content: "Debes ingresar una palabra",
            });
            return;
        }
        const evaluate = evaluateWord(ArrayWord, ArrayWrite, interaction);
    
        const isCorrect = evaluate.every((item) => item.emojie === "🟩");
    
        if (isCorrect) {
            wordGuessed = true;
            await interaction.reply({
                content: `Felicidades, has acertado la palabra del día: ${currentWord}`,
               
            });
        } else if (evaluate.length !== ArrayWord.length) {
            await interaction.reply({
                content: `La palabra debe tener ${ArrayWord.length} letras`,
                
            });
        } else {
            await interaction.reply({
                content: `${evaluate.map((item) => item.emojie + " " + item.character).join("\n")}`,
            });
        }
    }

const evaluateWord = (ArrayWord : string[], ArrayWrite : string[], interaction : any) => {

    const Result : ObjectWord[] = [];

    ArrayWrite.forEach((letter, index) => {
        if(letter === ArrayWord[index]){
            Result.push( {character : letter, emojie: "🟩"} );
        }else if(ArrayWord.includes(letter)){
            Result.push( {character : letter, emojie: "🟨"} );
        }else{
            Result.push( {character: letter, emojie: "🟥"});
        }
    });

    return Result;

}

const wordDay : Command = { data : word, execute: execute };
export default wordDay;