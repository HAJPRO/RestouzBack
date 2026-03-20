module.exports = class UserDto {
  id;
  username;
  fullname;
  department;
  isActivated;
  roles;
  permissions; // Guardlar uchun yangi maydon
  chatId;
  action;
  age;
  phoneNumber;
  address;
  position;
  status;
  isActive;
  registeredAt;
  carNumber;
  carType;
  carColor;
  profileImage;
  vehicleCapacity;
  lastLocation;
  workingHours;
  ratings;
  totalOrders;
  completedOrders;
  blockedUntil;
  notes;
  companyCode

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

    // --- ROLES: ID-lar massivini 'value'lar massiviga aylantirish ---
    this.roles = Array.isArray(model.roles)
      ? model.roles.map((r) => (typeof r === "object" ? r.value : String(r)))
      : [];

    // --- PERMISSIONS: Barcha rollar ichidagi permissionlarni yig'ish ---
    const permsSet = new Set();
    if (Array.isArray(model.roles)) {
      model.roles.forEach((role) => {
        if (role.permissions && Array.isArray(role.permissions)) {
          role.permissions.forEach((p) => {
            // Agar permission populate bo'lgan bo'lsa .value ni oladi
            permsSet.add(typeof p === "object" ? p.value : String(p));
          });
        }
      });
    }
    this.permissions = Array.from(permsSet);
  }
};