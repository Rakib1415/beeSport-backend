const { sportMonksCricketUrl } = require("../../utils/getAxios");

const getCricketFixturesByIds = async(req, res) => {

        // many hits for getting cricket fixtures by ids
        const arrayPromise = req?.query?.ids?.split(",")?.map((id) =>{
          return sportMonksCricketUrl.get(`/fixtures/${id}?include=league,localteam,visitorteam,scoreboards,runs,venue,balls,lineup`);
        });
    
        Promise.all(arrayPromise).then((resData) => {
          const allFixtures = resData?.map((item) => item?.data?.data);
    
          return res.status(200).json({
            status: !!allFixtures?.length,
            message: "Data Fetched Successfully!",
            data: allFixtures?.length > 0 ? allFixtures : "No Data Found!"
          })
    
        }).catch((error) => {
          // console.log("err", error);
        })

}

const getAllCricketleagues = async(req, res) => {
    const teamsData = await sportMonksCricketUrl.get('/leagues');

    return res.status(200).json({
        status : !!teamsData?.data?.data?.length,
        message : "teams data fetched successfully",
        data : teamsData?.data?.data
    });
}

const getAllCricketTeams = async(req, res) => {
    const teamsData = await sportMonksCricketUrl.get('/teams');
    return res.status(200).json({
        status : !!teamsData?.data?.data?.length,
        message : "teams data fetched successfully",
        data : teamsData?.data?.data
    });
}

module.exports = {
    getCricketFixturesByIds,
    getAllCricketleagues,
    getAllCricketTeams
}