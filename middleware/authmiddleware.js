 
 export function isLoggedIn(req, res, next) {
   if (req.session && req.session.user) {
     return next(); // Session exists → continue to route handler
   }
   
   res
     .status(401)
     .json({ success: false, message: "Please login to continue." });
 }

 // Check if the logged-in user is an admin
 export function isAdmin(req, res, next) {
   if (req.session.user?.role === "admin") {
     return next();
   }
   // Logged in but not admin → 403 Forbidden
   res
     .status(403)
     .json({ success: false, message: "Access denied. Admins only." });
 }

 // Check if the logged-in user is a manager (or admin — admins can do everything)
 export function isManager(req, res, next) {
   const role = req.session.user?.role;
   if (role === "manager" || role === "admin") {
     return next();
   }
   res
     .status(403)
     .json({ success: false, message: "Access denied. Managers only." });
 }
 