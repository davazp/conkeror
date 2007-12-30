var command_line_handlers = [];

var url_remoting_fn = load_url_in_new_frame;

function load_url_in_new_frame(url, ctx) {
    make_frame($load = url, $cwd = ctx.cwd);
}

function load_url_in_new_buffer(url, ctx) {
    find_url_new_buffer(url, null, ctx.cwd);
}

function command_line_handler(name, suppress_default, handler)
{
    command_line_handlers[name] = { suppress_default: suppress_default, func: handler };
}

function command_line_param_handler(name, suppress_default, handler)
{
    command_line_handlers[name] = { suppress_default: suppress_default,
                                    param: true,
                                    func: handler };
}

command_line_handler("batch", true);
command_line_param_handler("e", false, function (expr) {
        eval(expr);
    });
command_line_param_handler("chrome", true, function (uri) {
        try {
            make_chrome_frame(uri);
        } catch (e) { dump_error(e); }
    });
command_line_param_handler("q", false, function () {
        dumpln ("w: -q may only be used as the first argument.");
    });

command_line_param_handler("cwd", false, function (dir, ctx) {
        ctx.cwd = dir;
    });


function handle_command_line(cmdline)
{
    try {
        var suppress_default = false;
        var suppress_rc = false;

        var i = 0;

        /* -q must be the first argument, if it is given */
        if (cmdline.length > 0 && cmdline.getArgument(0) == "-q")
        {
            suppress_rc = true;
            i++;
        }

        var initial_launch = (cmdline.state == cmdline.STATE_INITIAL_LAUNCH);
        if (! suppress_rc && initial_launch)
        {
            try {
                load_rc ();
            } catch (e) { dump (e + "\n"); }
        } else if (suppress_rc && ! initial_launch) {
            dumpln ("w: attempt to suppress load_rc in remote invocation");
        }

        var ctx = {}; // command-line processing context

        for (; i < cmdline.length; ++i)
        {
            var arg = cmdline.getArgument(i);
            if (arg[0] == '-') {
                var arg1 = arg.substring(1);
                if (arg1 in command_line_handlers) {
                    var handler = command_line_handlers[arg1];
                    if (handler.suppress_default)
                        suppress_default = true;
                    if (handler.func) {
                        if (handler.param) {
                            i++; // increment the argument counter to skip the parameter
                            if (i >= cmdline.length) {
                                dump ("w: ignoring command switch `"+arg+"' because no argument was provided.\n");
                                continue;
                            }
                            var param = cmdline.getArgument (i);
                            handler.func(param, ctx);
                        } else {
                            handler.func(ctx);
                        }
                    }
                    continue;
                }
            }

            // something other than a switch was passed on the command
            // line.  suppress the default frame, and call the
            // user-configurable remoting function on it.
            //
            suppress_default = true;
            url_remoting_fn (arg, ctx);
        }

        // we are greedy and handle all command line arguments.  remove
        // everything from the command line object, so no other
        // components can see them.
        //
        if (cmdline.length > 0) {
            cmdline.removeArguments(0, cmdline.length - 1);
        }

        // no args were found for url_remoting_fn, and no switches
        // explicitly suppressed the creation of a default frame
        // (e.g. -batch or -daemon)
        //
        if (! suppress_default) {
            url_remoting_fn(homepage, ctx);
        }
    } catch (e) {
        dumpln("Error processing command line.");
        dump_error(e);
    }
}

