package io.ionic.starter;

import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.Service;
import android.content.Intent;
import android.os.Build;
import android.os.Handler;
import android.os.IBinder;
import android.os.Looper;
import android.os.Vibrator;

import androidx.annotation.Nullable;
import androidx.core.app.NotificationCompat;

public class CountdownService extends Service {

  public static final String CHANNEL_ID = "countdown_channel";

  @Override
  public int onStartCommand(Intent intent, int flags, int startId) {
    var seconds = intent.getIntExtra("seconds", 60);
    var endTime = System.currentTimeMillis() + seconds * 1000L;

    createChannel();

    var notification = new NotificationCompat.Builder(this, CHANNEL_ID)
      .setSmallIcon(R.drawable.ic_timer)
      .setContentTitle("Countdown")
      .setOngoing(true)
      .setUsesChronometer(true)
      .setChronometerCountDown(true)
      .setShowWhen(false)
      .setOnlyAlertOnce(true)
      .setWhen(endTime)
      .setPriority(NotificationCompat.PRIORITY_HIGH)
      .build();

    // Delay startForeground slightly to avoid a rare race where the channel
    // hasn't been fully registered by the system on first run.
    new Handler(Looper.getMainLooper()).postDelayed(() -> startForeground(1, notification), 50);

    // Schedule end-of-timer actions (vibrate once, then stop service)
    new Handler(Looper.getMainLooper()).postDelayed(() -> {
      vibrateOnce();
      stopSelf();
    }, seconds * 1000L);

    return START_NOT_STICKY;
  }

  private void createChannel() {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {

      var channel = new NotificationChannel(
        CHANNEL_ID,
        "Countdown Timer",
        NotificationManager.IMPORTANCE_HIGH);

      getSystemService(NotificationManager.class).createNotificationChannel(channel);
    }
  }

  @Override
  public void onDestroy() {
    stopForeground(true);
    super.onDestroy();
  }

  private void vibrateOnce() {
    var vibrator = getSystemService(Vibrator.class);
    if (vibrator != null && vibrator.hasVibrator()) {
      try {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
          vibrator.vibrate(android.os.VibrationEffect.createOneShot(400, android.os.VibrationEffect.DEFAULT_AMPLITUDE));
        } else {
          vibrator.vibrate(400);
        }
      } catch (Exception ignored) {
      }
    }
  }

  @Nullable
  @Override
  public IBinder onBind(Intent intent) {
    return null;
  }
}
