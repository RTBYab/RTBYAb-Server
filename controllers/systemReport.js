const si = require("systeminformation");
const Language = require("../helpers/Language");

exports.systemInfo = async (req, res) => {
  const systemInfo = await si.getAllData(escape(12));
  if (!systemInfo) res.status(404).json({ message: Language.fa.NoSystemInfo });
  res.json(systemInfo);
};
