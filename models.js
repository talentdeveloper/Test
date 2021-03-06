'use strict';

exports = module.exports = function(app, mongoose) {
  //embeddable docs first
  require('./schema/Note')(app, mongoose);
  require('./schema/Status')(app, mongoose);
  require('./schema/StatusLog')(app, mongoose);
  require('./schema/Category')(app, mongoose);

  //then regular docs
  require('./schema/User')(app, mongoose);
  require('./schema/Admin')(app, mongoose);
  require('./schema/AdminGroup')(app, mongoose);
  require('./schema/Account')(app, mongoose);
  require('./schema/LoginAttempt')(app, mongoose);
  require('./schema/Property')(app, mongoose);
  require('./schema/Video')(app, mongoose);
  require('./schema/StatusType')(app, mongoose);
  require('./schema/Quote')(app, mongoose);
  require('./schema/InstructionVideo')(app, mongoose);
  require('./schema/AdvInstructionVideo')(app, mongoose);
  require('./schema/ClosingStats')(app, mongoose);
  require('./schema/ClosingTitle')(app, mongoose);
  require('./schema/DownloadMaterial')(app, mongoose);
  require('./schema/SiteLink')(app, mongoose);
  require('./schema/Announcement')(app, mongoose);
  
};
