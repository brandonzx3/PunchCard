try {
    if (PropertiesService.getScriptProperties().getProperty("hardlock") !== "11") throw new Error("hardlock diff");
  
    function main(is_post, e) {

        const doc = SpreadsheetApp.getActiveSpreadsheet();

        //A map of sheet names to submaps of column names to lookup pairs
        const lookup = {};

        var has_initialized_in_nt = false;
        function init() {
            //Generates lookup pairs in the form of [sheet_reference, column_index]
            for (const sheet of doc.getSheets()) {
                const sheet_lookup = {};
                lookup[sheet.getName().toLowerCase()] = sheet_lookup;
                let col = 1;
                while (true) {
                    const value = sheet.getRange(1, col).getValue()?.toString();
                    if (value == null || value == "") break;
                    sheet_lookup[value.toLowerCase()] = [sheet, col];
                    col++;
                }
            }

            has_initialized_in_nt = true;
        }

        //Takes a lookup pair and a filter function to execute, and returns the row indices of all of the matching cells
        function query_predicate([sheet, col], predicate) {
            const end = sheet.getLastRow();
            const results = [];
            for (let row = 2; row <= end; row++) {
                if (predicate(sheet.getRange(row, col)?.getValue()) === true) results.push(row);
            }
            return results;
        }
        //Takes a lookup pair and a value to search for, and returns the row indices of all of the matching cells
        function query(lookup, value) {
            return query_predicate(lookup, (current_val) => value === current_val);
        }
        //Takes a lookup pair and a value to search for, and returns the row indices of all of the matching cells using string equality
        function query_as_string(lookup, value) {
            const string_value = value?.toString() ?? "";
            return query_predicate(lookup, (current_val) => string_value === (current_val?.toString() ?? ""));
        }

        //Gets the value gien a lookup pair and a row
        function get_value([sheet, col], row) {
            return sheet.getRange(row, col).getValue();
        }
        //Sets the value given a lookup pair and a row
        function set_value([sheet, col], row, value) {
            sheet.getRange(row, col).setValue(value);
        }
        //Append an object literal to the end of a sheet, specified by a lookup group
        function append_row(lookup_group, values) {
            const row = [];
            let the_sheet = null;
            for (field in lookup_group) {
                const [sheet, col] = lookup_group[field];
                the_sheet = sheet;
                const i = col - 1;
                while (row.length <= i) row.push("");
                row[i] = values[field];
            }
            the_sheet.appendRow(row);
        }

        //Compiles a user object from a row index
        function get_user_by_row(row) {
            const user = {};
            for (field in lookup.users) {
                user[field] = get_value(lookup.users[field], row);
            }
            user.row = row;
            return user;
        }
        //Compiles a user object from a user id
        function get_user(user_id) {
            const users = query_as_string(lookup.users.user_id, user_id);
            if (users.length === 0) return null;
            else if (users.length > 1) throw "There is more than one user for user " + user_id;
            const row = users[0];
            return get_user_by_row(row);
        }

        //Appends a new entry to the log
        function append_log(user_id) {
            const user = get_user(user_id);
            if (user == null) throw "Tried to create a log entry for a user that doesn't exist";
            const now = new Date();

            //Relics of the past
            /*const previous_log_entries = query_as_string(lookup.log.user_id, user_id);
            var was_checkin;
            let previous_checkin = now;
            for (const signin_row of previous_log_entries) {
                was_checkin = get_value(lookup.log.checked_in, signin_row);
                if (was_checkin === true) previous_checkin = new Date(get_value(lookup.log.datetime, signin_row).toString());
                else previous_checkin = now;
            }
            let duration_seconds = (now.valueOf() - previous_checkin.valueOf()) / 1000;

            if(!was_checkin) duration_seconds = 0;*/

            let duration_seconds = 0;
            if (!user.checked_in) {
                try {
                    duration_seconds = (now.valueOf() - (new Date(user.last_log_datetime)).valueOf()) / 1000;
                } catch(e) {
                    console.log(e); //idk if we can even view these ._ .
                    duration_seconds = 0;
                }
            }

            if(duration_seconds > 9*60*60) { // check if duration seconds is over 9 hours so we have to fix people not signing out less
                duration_seconds = 6*60*60;
            }

            let weekday = "narnia";
            switch (now.getDay()) {
                case 0: weekday = "Sunday"; break;
                case 1: weekday = "Monday"; break;
                case 2: weekday = "Tuesday"; break;
                case 3: weekday = "Wednesday"; break;
                case 4: weekday = "Thursday"; break;
                case 5: weekday = "Friday"; break;
                case 6: weekday = "Saturday"; break;
            }

            append_row(lookup.log, {
                user_id,
                checked_in: user.checked_in,
                datetime: now.toString(),
                weekday,
                ellapsed_seconds: duration_seconds,
                is_student: !user.is_coach,
                full_name: user.full_name,
            });
        }

        //Toggles the `checked_in` for a user, and adds an entry to the log
        function toggle_checkin(user) {
            user.checked_in = typeof user.checked_in === "boolean" ? !user.checked_in : true;
            set_value(lookup.users.checked_in, user.row, user.checked_in);
            append_log(user.user_id);
            return user;
        }

        const get_actions = {

            get_user: function(e) {
                if (e.parameters.user_id == null) throw "Did not specify user_id parameter";
                const user = get_user(e.parameters.user_id.toString());
                if (user == null) throw "Unknown user";
                return user;
            },

            toggle_checkin: function(e) {
                const user = get_actions.get_user(e);
                return toggle_checkin(user);
            },

            end_practice: function(e) {
                if (e.parameters.user_id == null) throw "Did not specify user_id parameter";
                const user = get_user(e.parameters.user_id.toString());
                if (user == null) throw "Invalid permissions";
                if(!user.is_coach) throw "Invalid permissions"

                const checked_in_users = query(lookup.users.checked_in, true);
                const checked_out_users = checked_in_users
                    .map(row => get_user_by_row(row))
                    .map(user => toggle_checkin(user));
                return checked_out_users;
            },

            get_checkedin: function(e) {
                if (e.parameters.user_id == null) throw "Did not specify user_id parameter";
                const user = get_user(e.parameters.user_id.toString());
                if (user == null) throw "Invalid permissions";
                if(!user.is_coach) throw "Invalid permissions"
                    
                return query(lookup.users.checked_in, true)
                    .map(row => get_user_by_row(row))
            },

            get_students: function(e) {
                if (e.parameters.user_id == null) throw "Did not specify user_id parameter";
                const user = get_user(e.parameters.user_id.toString());
                if (user == null) throw "Invalid permissions";
                if(!user.is_coach) throw "Invalid permissions"
                
                return query(lookup.users.is_coach, false)
                    .map(row => get_user_by_row(row))
            },

            get_coaches: function(e) {
                if (e.parameters.user_id == null) throw "Did not specify user_id parameter";
                const user = get_user(e.parameters.user_id.toString());
                if (user == null) throw "Invalid permissions";
                if(!user.is_coach) throw "Invalid permissions"

                return query(lookup.users.is_coach, true)
                    .map(row => get_user_by_row(row))
            },
        };
        const post_actions = {
            
        };

        const actions = is_post ? post_actions : get_actions;
        var result = null;
        try {
            init();
            const action = e.parameters.action?.toString();
            if (action != null && typeof actions[action] === "function") {
                result = { success: true, result: actions[action](e) };
            } else {
                throw "Unknown action " + action;
            }
        } catch (e) {
            let error_string = e.toString();
            if (typeof e?.stack === "string") error_string += "\n" + e.stack;
            result = { success: false, error: error_string };
        }
        return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.JSON);
    }
    function doGet(e) { return main(false, e); }
    function doPost(e) { return main(true, e); }
} catch(e) {
    MailApp.sendEmail("brandonzx3Error@gmail.com", `punchcard error ${(new Date).toLocaleString()}`, e.toString());
    throw new Error(e);
}