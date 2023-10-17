const SQRT3X2 = Math.sqrt(3) * 2;

/**
 * Represents a hexagonal grid using a 1D array with hexagon IDs (hexID) starting from a center position of 0
 * and "spiraling" outwards incremeniting each ID by 1. Technically, the grid is formed using
 * concentric rings of hexagons that surround the previous layer rather than strictly spiraling.
 * 
 * Does not implent graphical rendering. An external graphics/game library can be used to draw the grid based on the 
 * coordinates generated by this class using the hexCenters array property. maxHexID and layers may be useful as well
 * to determine the borders/edge of the grid.
 * 2D coordinates increment going right (x) and down (y) for ease of use with many graphics libraries.
 */
export class HexGrid {

    // TODO 
    // Rotation

    // TODO
    // Wrap around

    // TODO 
    // Offset

    constructor( layers, scale = 1, skew = 1 ) {
        // Set input properties
        this.layers = layers;
        this.scale = scale;
        this.skew = skew;

        // Calculate properties
        this.maxHexID = 3 * (layers + 1) * layers;
        this.hexagonPoints = [0, -2/SQRT3X2*skew*scale, 0.5*scale, -1/SQRT3X2*skew*scale, 0.5*scale, 1/SQRT3X2*skew*scale, 0, 2/SQRT3X2*skew*scale, -0.5*scale, 1/SQRT3X2*skew*scale, -0.5*scale, -1/SQRT3X2*skew*scale];
        
        // Calculate center positions of hexagons
        this.calculateHexagonCenters();

        // Calculate min and max X and Y values
        this.calculateGridBorders();
    }

    /**
     * Sets the scale of the HexGrid.
     * @param {number} scale - the new scale value
     */
    setScale( scale ){
        this.scale = scale;
        this.calculateHexagonCenters();
    }

    calculateHexagonCenters() {
        this.hexCenters = [];
        this.directions = [];

        // Set direction constants
        const RIGHT = this.vector2(1, 0);
        const UP_RIGHT = this.vector2(0.5, -3/SQRT3X2*this.skew);
        const UP_LEFT = this.vector2(-0.5, -3/SQRT3X2*this.skew);
        const LEFT = this.vector2(-1, 0);
        const DOWN_LEFT = this.vector2(-0.5, 3/SQRT3X2*this.skew);
        const DOWN_RIGHT = this.vector2(0.5, 3/SQRT3X2*this.skew);
        const BASE_DIRECTIONS = [ RIGHT, DOWN_RIGHT, DOWN_LEFT, LEFT, UP_LEFT, UP_RIGHT];

        // Scale direction vectors
        for (let i = 0; i < BASE_DIRECTIONS.length; i++) { 
            this.directions[i] = this.multiplyVector(BASE_DIRECTIONS[i], this.scale);
        }

        let currentHexCenter = this.vector2(0, 0);
        let hexID = 0;
        for (let currentLayer = 0; currentLayer <= this.layers; currentLayer++) {
            this.hexCenters[hexID] = this.vector2(currentHexCenter.x, currentHexCenter.y);
                
            // Move UP_RIGHT until top left corner
            for(let i = 0; i < currentLayer - 1; i++) {  
                currentHexCenter = this.addVectors(currentHexCenter, this.directions[5]);
                hexID++;   
                this.hexCenters[hexID] = this.vector2(currentHexCenter.x, currentHexCenter.y);
            }
    
            // Move other direction
            for(let i = 0; i < this.directions.length - 1; i++) {     
                for(let j = 0; j < currentLayer; j++){
                    currentHexCenter = this.addVectors(currentHexCenter, this.directions[i]);
                    hexID++;
                    this.hexCenters[hexID] = this.vector2(currentHexCenter.x, currentHexCenter.y);      
                }
            }
    
            // Move to next layer
            if (currentLayer < this.layers) {
                currentHexCenter = this.addVectors(currentHexCenter, this.directions[4])
                hexID++;  
            }   
        }
    }

    calculateGridBorders(){
        this.maxX = this.maxY = -Infinity;
        this.minX = this.minY = Infinity;
        for(let i = 0; i < this.hexCenters.length; i++) {  
            if ( this.hexCenters[i].x > this.maxX ) {
                this.maxX = this.hexCenters[i].x;
            }
            if ( this.hexCenters[i].x < this.minX ) {
                this.minX = this.hexCenters[i].x;
            }
            if ( this.hexCenters[i].y > this.maxY ) {
                this.maxY = this.hexCenters[i].y;
            }
            if ( this.hexCenters[i].y < this.minY ) {
                this.minY = this.hexCenters[i].y;
            } 
        }
        this.width = this.maxX - this.minX;
        this.height = this.maxY - this.minY;
    }

    /**
     * Adds two vectors together.
     *
     * @param {vector} vec1 - The first vector to be added.
     * @param {vector} vec2 - The second vector to be added.
     * @return {vector} Returns a new vector that is the sum of vec1 and vec2.
     */
    addVectors(vec1, vec2) {
        return { "x": vec1.x + vec2.x, "y": vec1.y + vec2.y };
    }

    /**
     * Multiplies a vector by a scalar.
     *
     * @param {vector} vector - The vector to be multiplied.
     * @param {number} scalar - The scalar to multiply the vector by.
     * @return {vector} The resulting multiplied vector.
     */
    multiplyVector(vector, scalar) {
        return { "x": vector.x * scalar, "y": vector.y * scalar };
    }

    /**
     * Calculates the distance between two vectors.
     *
     * @param {vector} vec1 - The first vector.
     * @param {vector} vec2 - The second vector.
     * @return {number} The distance between the two vectors.
     */
    vectorDistance(vec1, vec2){
        return Math.sqrt(Math.pow(vec1.x - vec2.x, 2) + Math.pow(vec1.y - vec2.y, 2));
    }

    /**
     * Creates a new Vector2 object with the given x and y values.
     *
     * @param {number} x - The x value of the vector.
     * @param {number} y - The y value of the vector.
     * @return {vector} - The new Vector2 object with x and y properties.
     */
    vector2(x, y){
        return {"x": x, "y": y};
    }

    // Implement only given a seperate world view coordinate
    // Currently this class only implements a constent internal coordate system
    // i.e. the positions of the hexagons never change.
    /**
     * Finds the hexagon that contains the given position.
     *
     * @param {vector} position - The position vector to be checked.
     * @return {int} The hexID of the hexagon that contains position.
    //  */
    // function hexIDAtPosition( position ) {
    //     let shortestDistance = Infinity;
    //     let closesthexID = 0;
    //     for (let i = 0; i < hexCenters.length; i++) {
    //         let distanceToHex = hexCenters[i].dist(createVector(position.x, position.y));
    //         if (distanceToHex < shortestDistance) {
    //             shortestDistance = distanceToHex;
    //             closesthexID = i;
    //         }
    //     }
    //     return closesthexID;
    // } 


    /**
     * Finds the hexagon that contains the given position.
     *
     * @param {vector} position - The position vector to be checked.
     * @return {int} The hexID of the hexagon that contains position.
     */
    hexIDAtPosition( position ) {
        let shortestDistance = Infinity;
        let closesthexID = 0;
        for (let i = 0; i < this.hexCenters.length; i++) {
            let distanceToHex = this.vectorDistance( this.hexCenters[i], position );
            if (distanceToHex < shortestDistance) {
                shortestDistance = distanceToHex;
                closesthexID = i;
            }
        }
        return closesthexID;
    } 

    /**
     * Calculates the starting hexID of the layer of a given hexID.
     *
     * @param {int} hexID - The hexID that is within the layer to check.
     * @return {int} The starting hexID of the layer.
     */
    layerStarthexID( hexID ){
        return 3 * ( this.layerOf(hexID) ) * ( this.layerOf(hexID) - 1) + 1;
    }

    /**
     * Calculate the starting hexID of the next layer.
     *
     * @param {int} hexID - The hex ID of the current layer.
     * @return {int} The starting hex ID of the next layer.
     */
    nextLayerStarthexID( hexID ){
        return 3 * ( this.layerOf(hexID) + 1 ) * this.layerOf(hexID) + 1;
    }

    /**
     * Calculates the starting hexID of the previous layer to a given hexagon.
     *
     * @param {int} hexID - The hexID of the hexagon to check.
     * @return {int} The starting hexID of the previous layer.
     */
    previousLayerStarthexID( hexID ){
        return 3 * ( this.layerOf(hexID) - 1 ) * ( this.layerOf(hexID) - 2 ) + 1;
    }

    /**
     * Calculates the position of a hexagon within its layer.
     *
     * @param {int} hexID - The hexID of the hexagon to check.
     * @return {int} The position of the hexagon within its layer.
     */
    positionInLayer( hexID ){
        return hexID - this.layerStarthexID(hexID);
    }

    /**
     * Returns the hexID of the hexagon at a given layer and corner position
     * @param {int} layer the layer to check
     * @param {int} corner position to check
     * corners: 0 (Top Left), 1 (Top Right), 2 (Right), 3 (Bottom Right), 4 (Bottom Left), 5 (Left)
     * @return {int} the hexID of the corner hexagon in the checked position
     */
    cornerHex( layer, corner ){
        return ( (3*layer) - (2-corner) ) * layer;
    }

    /**
     * Checks if the given hexID is in a corner hexagon position within its layer.
     *
     * @param {int} hexID - The hexID to be checked.
     * @return {bool} true if the hexID is a corner hexagon, false otherwise
     */
    isCornerHex( hexID ){
        return ( hexID == this.layerOf(hexID) * round( hexID/this.layerOf(hexID) ) );
    }
    
    /**
     * Calculates the number of hexagons in the layer of a given hexID
     *
     * @param {int} hexID - The hexID of a hexagon within the layer to check.
     * @return {int} The number of hexagons in the layer.
     */
    hexagonsInLayer( hexID ){
        return layerOf(hexID) * 6;
    }
        
    /**
     * The layer number of the given hexID
     * Starts with center hexagon layer of 0
     * 
     * @param {int} hexID - The hexID to be checked
     * @return {int} The layer number (distance from center) of the given hexID

     */
    layerOf( hexID ) {
        return Math.round( Math.sqrt(hexID/3) );
    }

    /**
     * The section/direction/side of the given hexID
     * 
     * Each section corresponds to a direction/side of each layer/ring
     * 0 (Top Left), 1 (Top), 2 (Top Right), 3 (Bottom Right), 4 (Bottom), 5 (Bottom Left)
     * Section 0 includes both left and top left corners. Section 5 includes no corners.   
     * All other sections only include their last corner.
     * 
     * @param {int} hexID to check.
     * @return {int} The section/direction/side that the given hexID is located in.
     */
    sectionOf(hexID) {
        if ( hexID == 0 ) return 0;
        return Math.floor(this.positionInLayer( hexID  ) / ( this.layerOf( hexID ) * 6 ) * 6);
    }

    /**
     * The up-left neighbor of the given hexID.
     *
     * @param {int} hexID - The hexID of the hexagon to check.
     * @return {int} The hexID of the up-left neighbor of the given hexagon.
     */
    upLeftNeighbor(hexID) {
        const section = this.sectionOf(hexID);
        const layer = this.layerOf(hexID);
        const sqrt6 =  Math.round(Math.sqrt(hexID / 3)) * 6;
        
        switch (section) {
            case 0:
            case 1:
                return hexID + sqrt6 + 1;
            case 2:
                return hexID - 1;
            case 3:
                return 2 - (sqrt6 - hexID);
            case 4:
                if (hexID !== this.cornerHex(layer, 4)) {
                    return hexID - sqrt6 + 2;
                }
            default:
                return hexID + 1;
        }
    }

    /**
     * The up-right neighbor of the given hexID.
     *
     * @param {int} hexID - The hexID of the hexagon to check.
     * @return {int} The hexID of the up-right neighbor of the given hexagon.
     */
    upRightNeighbor(hexID) {
        const layer = this.layerOf(hexID);
        const section = this.sectionOf(hexID);
        const sqrt6 = Math.round(Math.sqrt(hexID / 3)) * 6;

        switch (section) {
            case 0:
                return hexID !== this.cornerHex(layer, 0) ? hexID + 1 : hexID + sqrt6 + 2;
            case 3:
                return hexID - 1;
            case 4:
            case 5:
                return hexID - sqrt6 + 1;
            default:
                return hexID + sqrt6 + 2;
        }
    }

    /**
     * The right neighbor of the given hexID.
     *
     * @param {int} hexID - The hexID of the hexagon to check.
     * @return {int} The hexID of the right neighbor of the given hexagon.
     */
    rightNeighbor(hexID) {
        const section = this.sectionOf(hexID);
        const layer = this.layerOf(hexID);
        const sqrt6 = Math.round(Math.sqrt(hexID/3)) * 6;

        switch (section) {
            case 0:
                return hexID == this.cornerHex(layer, 0) ? hexID + 1 : hexID - sqrt6 + 6;
            case 1:
                return hexID == this.cornerHex(layer, 1) ? hexID + sqrt6 + 3 : hexID + 1;
            case 2:
            case 3:
                return hexID + sqrt6 + 3;
            case 4:
                return hexID - 1;
            case 5:
                return hexID - sqrt6;
        }

    }

    /**
     * The down-right neighbor of the given hexID.
     *
     * @param {int} hexID - The hexID of the hexagon to check.
     * @return {int} The hexID of the down-right neighbor of the given hexagon.
     */
    downRightNeighbor(hexID) {
        const section = this.sectionOf(hexID);
        const layer = this.layerOf(hexID);
        const sqrt6 = Math.round(Math.sqrt(hexID/3)) * 6;
        switch (section) {
            case 0:
                if (this.positionInLayer(hexID) == 0){
                    return hexID - 1;
                }
            case 1:
                return hexID === this.cornerHex(layer, 1) ? hexID + 1 : hexID - sqrt6 + 5;
            case 2:
                return hexID === this.cornerHex(layer, 2) ? hexID + sqrt6 + 4 : hexID + 1;
            case 3:
            case 4:
                return hexID + sqrt6 + 4;
            default:
                return hexID - 1;
        }
    }

    /**
     * The down-left neighbor of the given hexID.
     *
     * @param {int} hexID - The hexID of the hexagon to check.
     * @return {int} The hexID of the down-left neighbor of the given hexagon.
     */
    downLeftNeighbor(hexID) {
        const layer = this.layerOf(hexID);
        const section = this.sectionOf(hexID);
        const sqrt6 = Math.round(Math.sqrt(hexID / 3)) * 6;

        switch (section) {
            case 0:
                if(this.positionInLayer(hexID) == 0){
                    return hexID + sqrt6 - 1;
                }  
                return hexID - 1;          
            case 1:
            case 2:
                return hexID === this.cornerHex(layer, 2) ? hexID + 1 : hexID - sqrt6 + 4;
            case 3:
                return hexID === this.cornerHex(layer, 3) ? hexID + sqrt6 + 5 : hexID + 1;
            case 4: 
            default:
                return hexID + sqrt6 + 5; 
        }
    }

    /**
     * The left neighbor of the given hexID.
     *
     * @param {int} hexID - The hexID of the hexagon to check.
     * @return {int} The hexID of the left neighbor of the given hexagon.
     */
    leftNeighbor(hexID) {
        const layer = this.layerOf(hexID);
        const section = this.sectionOf(hexID);
        const sqrt6 = Math.round(Math.sqrt(hexID / 3)) * 6;

        switch (section) {
            case 0:
                return hexID + sqrt6;
            case 1:
                return hexID - 1;
            case 2:
            case 3:
                return hexID === this.cornerHex(layer, 3) ? hexID + 1 : hexID - sqrt6 + 3;
            case 4:
                return hexID === this.cornerHex(layer, 4) ? hexID + sqrt6 + 6 : hexID + 1;
            case 5:
                return hexID + sqrt6 + 6;
            default:
                return hexID;
        }
    }

    /**
     * Generates a list of neighbors for a given hexagon.
     *
     * @param {int} hexID - The hexID of the hexagon to check.
     * @return {Array} An array containing the hexIDs of the neighboring hexagons.
     */
    neighborsOf( hexID ){
        if (hexID == 0) return [1,2,3,4,5,6];
        
        let neighbors = [];
        let upLeftNeighborId = this.upLeftNeighbor(hexID);
        let upRightNeighborId = this.upRightNeighbor(hexID);
        let rightNeighborId = this.rightNeighbor(hexID);
        let downRightNeighborId = this.downRightNeighbor(hexID);
        let downLeftNeighborId = this.downLeftNeighbor(hexID);
        let leftNeighborId = this.leftNeighbor(hexID);
        
        if (upLeftNeighborId <= this.maxHexID){
            neighbors.push(upLeftNeighborId);
        }
        if (upRightNeighborId <= this.maxHexID){
            neighbors.push(upRightNeighborId);
        }
        if (rightNeighborId <= this.maxHexID){
            neighbors.push(rightNeighborId);
        }
        if (downRightNeighborId <= this.maxHexID){
            neighbors.push(downRightNeighborId);
        }
        if (downLeftNeighborId <= this.maxHexID){
            neighbors.push(downLeftNeighborId);
        }
        if (leftNeighborId <= this.maxHexID){
            neighbors.push(leftNeighborId);
        }
        
        return neighbors;
    }

    randomHexID( centerHexID, radius ) {
        let centerPosition = this.hexCenters[centerHexID];
        let randomDistance = this.scale * radius * Math.random();
        let randomDirection = 2 * Math.PI * Math.random();
        let pickedPosition = {
            x: centerPosition.x + randomDistance * Math.cos(randomDirection),
            y: centerPosition.y + randomDistance * Math.sin(randomDirection)
        };
        return this.hexIDAtPosition( pickedPosition );
    }
}