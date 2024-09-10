export const LANGUAGAE_VERSIONS = {
    javascript: "18.15.0",
    typescript: "5.0.4",
    python: "3.10.0",
    java: "15.0.2",
    csharp: "6.12.0",
    php: "8.2.3",

}

export const CODE_SNIPPETS = {
    javascript: `\nfunction sayhello(name){ \n\t console.log("Hello, " + name + "!"); \n}\n sayhello("Shardul");\n`,
    typescript: `
    function sayHello(name: string): void {
    console.log(\`Hello, \${name}!\`);
    }
    sayHello("Shardul");`,
    python: `
    def say_hello(name):
        print(f"Hello, {name}!")
    
    say_hello("Shardul")
      `,
    java: `
    public class Main {
    public static void main(String[] args) {
        sayHello("Shardul");
    }

    public static void sayHello(String name) {
        System.out.println("Hello, " + name + "!");
    }
   }`,
   csharp: `
   using System;
   
   class Program {
       static void Main() {
           SayHello("Shardul");
       }
   
       static void SayHello(string name) {
           Console.WriteLine("Hello, " + name + "!");
       }
   }
     `,

     php: `
     <?php
     function sayHello($name) {
         echo "Hello, " . $name . "!";
     }
     
     sayHello("Shardul");
     ?>
       `,



}