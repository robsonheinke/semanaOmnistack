const connection = require('../database/connection');

module.exports = {
    async index(request, response){
        const { page = 1 } = request.query;  //esta pegando o numero de paginas da query e se não tiver esta definindo como 1

        const [count] = await connection('incidents').count();
        console.log( count )

        const incidents = await connection('incidents')
            .join('ongs', 'ongs.id', '=', 'incidents.ong_id') //inner join com a tabela ongs
            .limit(5)       //limit de resultados por pagina
            .offset((page-1)*5) //definindo a paginação pag 1 do 0 ao 4 pag2 do 5 ao 9 e assim por diante
            .select([
                'incidents.*',
                'ongs.name',
                'ongs.email',
                'ongs.whatsapp',
                'ongs.city',
                'ongs.uf'
            ]);
        
        response.header('X-Total-Count', count['count(*)']);
        return response.json(incidents);
    },

    async create(request, response){
        const { title, description, value } = request.body;
        const ong_id = request.headers.authorization;

        const [id] = await connection('incidents').insert({
            title,
            description,
            value,
            ong_id
        });
        return response.json({ id });
    },

    async delete(request, response){
        const { id } = request.params;
        const ong_id = request.headers.authorization;

        const incident = await connection('incidents')
            .where('id', id)
            .select('ong_id')
            .first();
        
        if(incident.ong_id !== ong_id){
            return response.status(401).json({error: 'operation not permitted.'});
        }

        await connection('incidents').where('id', id).delete();

        return response.status(204).send();
    }
}