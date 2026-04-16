module.exports = class UserDto {
  constructor(model) {
    this.id = model._id;
    this.username = model.username;
    this.fullname = model.fullname;
    this.department = model.department;
    this.isActivated = model.isActivated;
    this.chatId = model.chatId;
    this.action = model.action;
    this.age = model.age;
    this.phoneNumber = model.phoneNumber;
    this.address = model.address;
    this.position = model.position;
    this.status = model.status;
    this.isActive = model.isActive;
    this.registeredAt = model.registeredAt;
    this.carNumber = model.carNumber;
    this.carType = model.carType;
    this.carColor = model.carColor;
    this.profileImage = model.profileImage;
    this.vehicleCapacity = model.vehicleCapacity;
    this.lastLocation = model.lastLocation;
    this.workingHours = model.workingHours;
    this.ratings = model.ratings;
    this.totalOrders = model.totalOrders;
    this.completedOrders = model.completedOrders;
    this.blockedUntil = model.blockedUntil;
    this.notes = model.notes;
    this.companyCode = model.companyCode;

    // --- ROLES ---
    // Rollarni qanday bo'lsa shunday saqlaymiz (Populate bo'lgan bo'lsa ob'ekt, bo'lmasa ID)
    this.roles = Array.isArray(model.roles) ? model.roles : [];
    
    // Agar permissions alohida kerak bo'lmasa, uni bu yerdan olib tashladik.
  }
};