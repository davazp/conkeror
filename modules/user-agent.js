/**
 * (C) Copyright 2007-2011 John J. Foerch
 * (C) Copyright 2007-2008 Jeremy Maitin-Shepard
 *
 * Use, modification, and distribution are subject to the terms specified in the
 * COPYING file.
**/

default_pref("general.useragent.extra.conkeror", "Conkeror/"+version);

/**
 * set_user_agent overrides the user agent string globally with whatever
 * string is passed to it.  If called with null or no argument, any
 * current override is undone, reverting to Conkeror's default user agent
 * string.  The override is performed (rather non-conventionally) with a
 * default pref instead of a user pref, which allows the override to be
 * done cleanly from the rc, without interference by persisting prefs in
 * the profile.
 */
function set_user_agent (str) {
    const p = "general.useragent.override";
    if (str == null) {
        clear_default_pref(p);
        user_pref(p, "");
        clear_pref(p);
    } else
        session_pref(p, str);
}
