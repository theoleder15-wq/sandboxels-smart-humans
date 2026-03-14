// Ultimate Civilization Humans Mod

elements.civ_human = {
    color: "#e6b594",
    category: "life",
    state: "solid",
    density: 1000,

    properties: {
        hunger: 0,
        energy: 100,
        age: 0,
        tribe: null,
        role: null,
        wood: 0,
        food: 0,
        leader: false
    },

    tick: function(pixel) {

        pixel.age++;
        pixel.hunger++;
        pixel.energy--;

        // death
        if(pixel.hunger > 900 || pixel.energy <= 0) {
            changePixel(pixel,"rotten_meat");
            return;
        }

        // assign tribe
        if(pixel.tribe === null) {
            pixel.tribe = Math.floor(Math.random()*10000);
        }

        // assign role
        if(pixel.role === null) {
            let r = Math.random();
            if(r < 0.5) pixel.role = "farmer";
            else if(r < 0.8) pixel.role = "builder";
            else pixel.role = "warrior";
        }

        // first tribe member becomes leader
        if(!pixel.leader && Math.random() < 0.0005) {
            pixel.leader = true;
        }

        // scan environment
        for(let dx=-4; dx<=4; dx++) {
            for(let dy=-4; dy<=4; dy++) {

                let x = pixel.x + dx;
                let y = pixel.y + dy;

                if(!isEmpty(x,y,true)) {

                    let other = pixelMap[x][y];

                    // FOOD SEEKING
                    if(["plant","bread","meat"].includes(other.element)) {

                        if(Math.abs(dx)<=1 && Math.abs(dy)<=1) {
                            deletePixel(x,y);
                            pixel.hunger = 0;
                            pixel.food++;
                        }
                        else {
                            tryMove(pixel,pixel.x+Math.sign(dx),pixel.y+Math.sign(dy));
                        }
                        return;
                    }

                    // TREE GATHERING
                    if(other.element === "tree") {

                        if(Math.abs(dx)<=1 && Math.abs(dy)<=1) {
                            deletePixel(x,y);
                            pixel.wood++;
                        }
                        else {
                            tryMove(pixel,pixel.x+Math.sign(dx),pixel.y+Math.sign(dy));
                        }
                        return;
                    }

                    // ENEMY TRIBE
                    if(other.element === "civ_human" && other.tribe !== pixel.tribe) {

                        if(pixel.role === "warrior") {

                            if(Math.abs(dx)<=1 && Math.abs(dy)<=1) {
                                if(Math.random() < 0.4) {
                                    changePixel(other,"blood");
                                }
                            }
                            else {
                                tryMove(pixel,pixel.x+Math.sign(dx),pixel.y+Math.sign(dy));
                            }

                            return;
                        }
                    }

                }

            }
        }

        // FARMING (farmers)
        if(pixel.role === "farmer") {

            if(Math.random() < 0.004) {

                if(isEmpty(pixel.x,pixel.y+1,true)) {
                    createPixel("plant",pixel.x,pixel.y+1);
                }

            }

        }

        // BUILDING (builders)
        if(pixel.role === "builder" && pixel.wood >= 3) {

            if(Math.random() < 0.01) {

                for(let i=-1;i<=1;i++) {
                    if(isEmpty(pixel.x+i,pixel.y+1,true)) {
                        createPixel("wood",pixel.x+i,pixel.y+1);
                    }
                }

                pixel.wood -= 3;
            }

        }

        // LEADER BONUS
        if(pixel.leader) {

            if(Math.random() < 0.01) {
                pixel.energy += 10;
            }

        }

        // REPRODUCTION
        if(pixel.age > 200 && Math.random() < 0.003) {

            let spawnX = pixel.x + (Math.random()<0.5?-1:1);

            if(isEmpty(spawnX,pixel.y,true)) {

                let baby = createPixel("civ_human",spawnX,pixel.y);
                baby.tribe = pixel.tribe;

            }

        }

        // wandering
        if(Math.random() < 0.2) {

            tryMove(
                pixel,
                pixel.x + (Math.floor(Math.random()*3)-1),
                pixel.y
            );

        }

    }
};
// replace default humans with smart humans
elements.human.tick = elements.civ_human.tick;
