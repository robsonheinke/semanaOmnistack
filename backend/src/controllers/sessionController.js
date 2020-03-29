const connection = require('../database/connection');

module.exports = {
    async create(request, response){
        const { id } = request.body;

        const ong = await connection('ongs')
            .where('id', id) //qual campo filtrar
            .select('name')  //qual 
            .first();        //ira retornar o primeiro valor

        if(!ong){
            return response.status(400).json({ error: 'No ONG found with this ID'});
        }

        return response.json(ong);
    }
}