package io.ionic.starter;

import android.Manifest;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.content.pm.PackageManager;
import android.os.Build;
import com.getcapacitor.BridgeActivity;
import androidx.core.app.ActivityCompat;

public class MainActivity extends BridgeActivity {
  private static final int REQUEST_POST_NOTIFICATIONS = 1001;

  @Override
  public void onCreate(android.os.Bundle savedInstanceState) {
    registerPlugin(CountdownPlugin.class);
    super.onCreate(savedInstanceState);

    // Request POST_NOTIFICATIONS on Android 13+ so foreground notifications appear.
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
      if (checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS)
        != PackageManager.PERMISSION_GRANTED) {
        ActivityCompat.requestPermissions(this,
          new String[]{Manifest.permission.POST_NOTIFICATIONS},
          REQUEST_POST_NOTIFICATIONS);
      }
    }
  }
}
