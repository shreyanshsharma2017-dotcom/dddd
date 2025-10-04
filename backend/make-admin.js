app.get("/make-admin", async (req, res) => {
  try {
    const user = await User.findOneAndUpdate(
      { firstName: "Shreyansh", lastName: "Sharma" },
      { role: "Admin" },
      { new: true }
    );
    if (!user) return res.send({ success: false, message: "User not found" });
    res.send({ success: true, user });
  } catch (err) {
    res.status(500).send({ success: false, message: err.message });
  }
});
