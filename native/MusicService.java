package com.musikglass.app;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.content.pm.ServiceInfo;
import android.os.Build;
import android.os.IBinder;
import android.os.PowerManager;

public class MusicService extends Service {
    static MusicService inst;
    private PowerManager.WakeLock wl;

    static Notification build(Context x, String t, String a, boolean playing) {
        NotificationManager nm = (NotificationManager) x.getSystemService(Context.NOTIFICATION_SERVICE);
        Notification.Builder b;
        if (Build.VERSION.SDK_INT >= 26) {
            nm.createNotificationChannel(new NotificationChannel("play", "Pemutar musik", NotificationManager.IMPORTANCE_LOW));
            b = new Notification.Builder(x, "play");
        } else {
            b = new Notification.Builder(x);
        }
        Intent open = x.getPackageManager().getLaunchIntentForPackage(x.getPackageName());
        PendingIntent pi = PendingIntent.getActivity(x, 0, open, Build.VERSION.SDK_INT >= 23 ? PendingIntent.FLAG_IMMUTABLE : 0);
        return b.setContentTitle(t)
                .setContentText(playing ? a : "Dijeda - " + a)
                .setSmallIcon(android.R.drawable.ic_media_play)
                .setContentIntent(pi)
                .setOngoing(true)
                .build();
    }

    static void wake(boolean on) {
        if (inst != null) inst.setWake(on);
    }

    void setWake(boolean on) {
        if (wl == null) {
            wl = ((PowerManager) getSystemService(POWER_SERVICE)).newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "musikglass:play");
            wl.setReferenceCounted(false);
        }
        if (on && !wl.isHeld()) wl.acquire();
        else if (!on && wl.isHeld()) wl.release();
    }

    @Override public void onCreate() { super.onCreate(); inst = this; }
    @Override public IBinder onBind(Intent i) { return null; }

    @Override
    public int onStartCommand(Intent in, int flags, int id) {
        String t = in != null && in.getStringExtra("t") != null ? in.getStringExtra("t") : "Musik Glass";
        String a = in != null && in.getStringExtra("a") != null ? in.getStringExtra("a") : "";
        boolean p = in == null || in.getBooleanExtra("p", true);
        Notification n = build(this, t, a, p);
        if (Build.VERSION.SDK_INT >= 29) startForeground(1, n, ServiceInfo.FOREGROUND_SERVICE_TYPE_MEDIA_PLAYBACK);
        else startForeground(1, n);
        setWake(p);
        return START_NOT_STICKY;
    }

    @Override public void onTaskRemoved(Intent rootIntent) { stopSelf(); }

    @Override
    public void onDestroy() {
        setWake(false);
        inst = null;
        super.onDestroy();
    }
}
