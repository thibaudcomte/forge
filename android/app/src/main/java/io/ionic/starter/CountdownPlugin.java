package io.ionic.starter;

import android.content.Intent;

import androidx.core.content.ContextCompat;

import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "Countdown")
public class CountdownPlugin extends Plugin {
  @PluginMethod
  public void start(PluginCall call) {
    var seconds = 10; //call.getInt("seconds", 60);
    var intent = new Intent(getContext(), CountdownService.class);
    intent.putExtra("seconds", seconds);
    ContextCompat.startForegroundService(getContext(), intent);
    call.resolve();
  }

  @PluginMethod
  public void stop(PluginCall call) {
    var intent = new Intent(getContext(), CountdownService.class);
    getContext().stopService(intent);
    call.resolve();
  }
}
