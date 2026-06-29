const supabase = require('../config/database');

class ActivityLogger {
  static async log(actorId, actorName, actionType, description, relatedInternId = null) {
    try {
      const { error } = await supabase
        .from('activity_log')
        .insert([{
          actor_id: actorId,
          actor_name: actorName,
          action_type: actionType,
          description,
          related_intern_id: relatedInternId,
        }]);

      if (error) console.error('Activity log insert failed:', error);
    } catch (error) {
      console.error('Activity logger error (non-blocking):', error);
    }
  }
}

module.exports = ActivityLogger;