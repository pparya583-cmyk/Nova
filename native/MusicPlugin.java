package com.novamusic.app;

import android.content.Context;
import android.content.Intent;
import android.os.Build;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

/** Jembatan JS -> service: Capacitor.Plugins.Music.start/update/stop */
@CapacitorPlugin(name = "Music")
public class MusicPlugin extends Plugin {
    private void push(PluginCall call) {
        Context c = getContext();
        Intent i = new Intent(c, MusicService.class)
                .putExtra("title", call.getString("title", "NovaMusic"))
                .putExtra("artist", call.getString("artist", ""))
                .putExtra("playing", call.getBoolean("playing", true));
        try {
            if (Build.VERSION.SDK_INT >= 26) c.startForegroundService(i); else c.startService(i);
            call.resolve(new JSObject());
        } catch (Exception e) { call.reject(e.getMessage()); }
    }
    @PluginMethod public void start(PluginCall call) { push(call); }
    @PluginMethod public void update(PluginCall call) { push(call); }
    @PluginMethod public void stop(PluginCall call) {
        Context c = getContext();
        c.stopService(new Intent(c, MusicService.class));
        call.resolve();
    }
}
