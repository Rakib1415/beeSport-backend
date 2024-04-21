const { sportMonkslUrl } = require("../../../../utils/getAxios");
const Fixture = require("../models/Fixture");


exports.getAllFixtures = async(req, res) => {

    const page = req?.query?.page;
    const limit = req?.query?.limit;
    const date = req?.query?.date

    try{

        const fixtures = await sportMonkslUrl.get(`/fixtures/date/${date}?include=sport;league;participants;scores&per_page=${limit}&page=${page}`);

        res.status(200).json({
            status : true,
            message : "successfully retrieve fixtures data",
            data : fixtures?.data
        })

    }catch(err){
        console.log("error occuring get all fixtures", err)
        res.status(500).json({
            status : false,
            message : "something went wrong",
        })
    }
}


exports.createSelectedFixtures = async(req, res) => {

    const {fixtures} = req?.body;
    const fixtureIds = fixtures?.map((item) => item?.id);
    
    try{

        const fixtureResponse = await sportMonkslUrl.get(`/fixtures/multi/${fixtureIds?.join()}?include=sport;league;participants;scores`);

        const modifiedFixtures = fixtureResponse?.data?.data?.map((fixture) => {

            const selectedFixture = fixtures?.find((item) => item?.id === fixture?.id);

            return {
                name : fixture?.name,
                fixtureId : fixture?.id,
                league : {
                    id : fixture?.league?.id,
                    name : fixture?.league?.name,
                    image : fixture?.league?.image_path
                },
                startingAt : fixture?.starting_at,
                matchType : selectedFixture?.matchType,
                participants : fixture?.participants?.map((participant) => {
                    const currentScore = fixture?.scores?.find((score) => (score?.description === 'CURRENT' && score?.participant_id === participant?.id))
                    return {
                        id : participant?.id,
                        name : participant?.name,
                        image : participant?.image_path,
                        score : currentScore?.score?.goals ? currentScore?.score?.goals : 0
                    }
                })
            }
        });

        const createdFixtures = await Fixture.insertMany(modifiedFixtures);

        res.status(200).json({
            status : true,
            message : "successfully created fixtures data",
            data : createdFixtures
        })

    }catch(err){
        console.log("error occuring get all fixtures", err)
        res.status(500).json({
            status : false,
            message : "something went wrong",
        })
    }
}