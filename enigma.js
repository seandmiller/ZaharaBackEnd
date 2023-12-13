require('dotenv').config();

const EnigmaEncrypt = class {

    
    constructor(text,rotorChoices,cycles, plugBoard= process.env.PLUG_BOARD) {
this.text = text.toUpperCase();
this.rotorChoices = rotorChoices;
this.plugBoard   = plugBoard;
this.cycles = cycles;
this.rotorOne      = process.env.ROTOR_ONE.split(':');

this.rotorTwo      = process.env.ROTOR_TWO.split(':');

this.rotorThree    = process.env.ROTOR_THREE.split(':');

this.rotorFour     = process.env.ROTOR_FOUR.split(':');

this.rotorFive     = process.env.ROTOR_FIVE.split(':');
  

this.plug          = {'A':'A', 'B':'B', 'C':'C', 'D':'D','E':'E',
                       'F':'F','G':'G','H':'H', 'I':'I','J':'J',
                       'K':'K','L':'L','M':'M','N':'N','O':'O','P':'P',
                       'Q':'Q','R':'R','S':'S','T':'T','U':'U','V':'V',
                       'W':'W','X':'X','Y':'Y','Z':'Z','1':'1','2':'2',
                       '3':'3','4':'4','5':'5','6':'6','7':'7','8':'8','9':'9','0':'0',' ':' ', '$':'$', '%':'%' };
this.rotors = [this.rotorOne, this.rotorTwo, this.rotorThree, this.rotorFour, this.rotorFive]


this.rotorConfig = {};

for (let i = 0; i < this.rotorChoices.length; i++) {
        this.rotorConfig['rotor' + (i + 1).toString()] = this.rotors[rotorChoices[i]]
    }
       
let idx = 0
    for (let i = 0; i < this.plugBoard.length / 2; i++) {
    var letterSwap1 = plugBoard[idx]
    var letterSwap2 = plugBoard[idx+1]
    this.plug[letterSwap1] = letterSwap2
    this.plug[letterSwap2] = letterSwap1
    idx = idx + 2};
            
   this.rotate = this.rotate.bind(this);
   this.enigma = this.enigma.bind(this); 

    }


rotate = (num,  rotor = this.rotorOne) =>  {
       for (let i = 0; i < num; i++) {
            var letter = rotor[1][0]
            rotor[1] = rotor[1].substring(1);
            rotor[1] = rotor[1] + letter
        }
      return  rotor[1];};
      
      enigma = () =>  {

        const {rotor1, rotor2, rotor3} = this.rotorConfig;
        const reflector = ['ABCDEFGHIJKLMNOPQRSTUVWXYZ_1234567890$%',
        '%$0987654321_ZYXWVUTSRQPONMLKJIHGFEDCBA'];
        
        var newText = '';
        let [r1, r2] = [this.cycles,0];
        this.rotate(r1,rotor1);
        
        for (let i = 0; i < this.text.length; i++) {
            var letter = this.text[i];
            if (!rotor1[0].includes(letter)) {
             
                continue
            }
        
            letter = this.plug[letter];
        
            const lengthOfR = rotor1[1].length;
            
            var firstIdx = rotor1[1].indexOf(letter);
            
            var secondLetter = rotor2[0][firstIdx];
            
            var secondIdx    = rotor2[1].indexOf(secondLetter);
            var thirdLetter  = rotor3[0][secondIdx];
            
            var thirdIdx     = rotor3[1].indexOf(thirdLetter);
            
            var reflectorLetter = reflector[1][thirdIdx]
            var reflectorIdx    = reflector[0].indexOf(reflectorLetter);
            
            thirdLetter         = rotor3[1][reflectorIdx]
            thirdIdx            = rotor3[0].indexOf(thirdLetter);
            secondLetter        = rotor2[1][thirdIdx];
        
            secondIdx           = rotor2[0].indexOf(secondLetter);
            var output          = rotor1[1][secondIdx];
            output         = this.plug[output];
        
            newText = newText + output;
            this.rotate(1,rotor1);
            r1++
            if (r1 >= lengthOfR) {
                this.rotate(1, rotor2);
                r2++
                r1 = 0
            };
            if (r2 >= lengthOfR) {
                this.rotate(1, rotor3)
                r2 = 0;
            };
        
        }
        
        return newText;      };     




   
}







module.exports = EnigmaEncrypt;