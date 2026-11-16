package com.novamusic.app;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Intent;
import android.content.pm.ServiceInfo;
import android.os.Build;
import android.os.IBinder;
import android.os.PowerManager;

/** Foreground service agar musik tetap berjalan saat layar mati / aplikasi di latar belakang. */
public class MusicService extends Service {
    static final String CH = "novamusic_playback";
    private PowerManager.WakeLock wake;

    @Override public void onCreate() {
        super.onCreate();
        if (Build.VERSION.SDK_INT >= 26) {
            NotificationChannel c = new NotificationChannel(CH, "Pemutar musik", NotificationManager.IMPORTANCE_LOW);
            c.setShowBadge(false);
            getSystemService(NotificationManager.class).createNotificationChannel(c);
        }
        PowerManager pm = (PowerManager) getSystemService(POWER_SERVICE);
        wake = pm.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "NovaMusic:play");
        wake.setReferenceCounted(false);
    }

    @Override public int onStartCommand(Intent i, int flags, int id) {
        if (i != null && "STOP".equals(i.getAction())) { stopSelf(); return START_NOT_STICKY; }
        String title = i != null && i.hasExtra("title") ? i.getStringExtra("title") : "NovaMusic";
        String artist = i != null && i.hasExtra("artist") ? i.getStringExtra("artist") : "";
        boolean playing = i == null || i.getBooleanExtra("playing", true);
        Intent open = new Intent(this, MainActivity.class).setFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP);
        PendingIntent pi = PendingIntent.getActivity(this, 0, open, PendingIntent.FLAG_IMMUTABLE | PendingIntent.FLAG_UPDATE_CURRENT);
        Notification.Builder b = Build.VERSION.SDK_INT >= 26 ? new Notification.Builder(this, CH) : new Notification.Builder(this);
        Notification n = b.setContentTitle(title).setContentText(playing ? artist : "Dijeda · " + artist)
                .setSmallIcon(android.R.drawable.ic_media_play).setContentIntent(pi)
                .setOngoing(playing).setOnlyAlertOnce(true).build();
        if (Build.VERSION.SDK_INT >= 29) startForeground(1, n, ServiceInfo.FOREGROUND_SERVICE_TYPE_MEDIA_PLAYBACK);
        else startForeground(1, n);
        if (playing) { if (!wake.isHeld()) wake.acquire(6 * 60 * 60 * 1000L); } else if (wake.isHeld()) wake.release();
        return START_STICKY;
    }

    @Override public void onDestroy() { if (wake != null && wake.isHeld()) wake.release(); super.onDestroy(); }
    @Override public IBinder onBind(Intent i) { return null; }
}
