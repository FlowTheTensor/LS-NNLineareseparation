class Punkt
{
 
  constructor (bereich)
  {
    this.x = random(0,bereich);
    this.y = random(0,bereich);
    this.label;
    this.korrekt = false;
    
    if(this.x+100> this.y)
      {this.label = 1;}
    else
      {this.label = -1;}
  }
  
  
  show()
  {
    
    if(this.korrekt)
      {
        strokeWeight(1);
    stroke(0);        
      }  
    else
      {
        strokeWeight(7);
    stroke(0);
      }
    
    if(this.label==-1)
      {
        
        fill(255,0,0);
      }
    else
      {
        
        fill(127,127,255);
      }
    
    ellipse(this.x,this.y,15,15);
    
    strokeWeight(1);
    stroke(0);
    
  }
  
}
