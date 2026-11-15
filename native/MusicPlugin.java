package com.musikglass.app;

import android.app.NotificationManager;
import android.content.Context;
import android.content.Intent;
import android.os.Build;
import androidx.core.app.ActivityCompat;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "Music")
public class MusicPlugin extends Plugin {
    @PluginMethod
    public void start(PluginCall c) {
        try {
            if (Build.VERSION.SDK_INT >= 33) {
                ActivityCompat.requestPermissions(getActivity(), new String[]{"android.permission.POST_NOTIFICATIONS"}, 77);
            }
            Context x = getContext();
            Intent i = new Intent(x, MusicService.class);
            i.putExtra("t", c.getString("title", "Musik Glass"));
            i.putExtra("a", c.getString("artist", ""));
            i.putExtra("p", c.getBoolean("playing", true));
            if (Build.VERSION.SDK_INT >= 26) x.startForegroundService(i); else x.startService(i);
        } catch (Exception e) { }
        c.resolve();
    }

    @PluginMethod
    public void update(PluginCall c) {
        try {
            Context x = getContext();
            boolean p = c.getBoolean("playing", true);
            NotificationManager nm = (NotificationManager) x.getSystemService(Context.NOTIFICATION_SERVICE);
            nm.notify(1, MusicService.build(x, c.getString("title", "Musik Glass"), c.getString("artist", ""), p));
            MusicService.wake(p);
        } catch (Exception e) { }
        c.resolve();
    }

    @PluginMethod
    public void stop(PluginCall c) {
        try { getContext().stopService(new Intent(getContext(), MusicService.class)); } catch (Exception e) { }
        c.resolve();
    }
}
