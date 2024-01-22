import AutoPilot from "https://deno.land/x/autopilot@0.4.0/mod.ts";
import { serve } from "https://deno.land/std@0.150.0/http/server.ts";
import { Server } from "https://deno.land/x/socket_io@0.2.0/mod.ts";
import { readAll } from "https://deno.land/std@0.92.0/io/util.ts";

const pilot = new AutoPilot();
const io = new Server();
let connected = false;

io.on("connection", (socket) => {
  if (connected) {
    console.log("重复连接");
    socket.disconnect();
    return;
  }
  connected = true;
  console.log("connected");
  socket.on("disconnect", () => {
    connected = false;
    console.log("disconnected");
  });
  socket.on("move", (rx, ry, rw, rh) => {
    const x = (rx / rw) * pilot.screenSize().width;
    const y = (ry / rh) * pilot.screenSize().height;
    console.log("move", x, y);
    pilot.moveMouse(x, y, 0);
  });
  socket.on("click", () => {
    console.log("click");
    pilot.click("left");
  });
  socket.on("menu", () => {
    console.log("menu");
    pilot.click("right");
  });
});

await serve(
  io.handler(async () => {
    const file = await Deno.open("client.html");
    const html = new TextDecoder().decode(await readAll(file));
    return new Response(html, {
      headers: {
        "Content-Type": "text/html;charset=utf-8",
      },
    });
  }),
  {
    hostname: "0.0.0.0",
    port: 10073,
  }
);

// import { Plug } from "https://deno.land/x/plug@0.4.0/mod.ts";
// await Plug.prepare(
//   {
//     name: "autopilot_deno",
//     url: "https://github.1git.de/littledivy/autopilot-deno/releases/download/0.4.0",
//   },
//   {
//     mouse_pixel_color_g: { parameters: [], result: "u8" },
//     smooth_mouse_move: { parameters: ["buffer", "usize"], result: "void" },
//     mouse_pixel_color_b: { parameters: [], result: "u8" },
//     toggle_key: { parameters: ["buffer", "usize"], result: "void" },
//     screenscale: { parameters: [], result: "f64" },
//     mouse_pixel_color_r: { parameters: [], result: "u8" },
//     mouse_move: { parameters: ["buffer", "usize"], result: "void" },
//     mouse_scroll: { parameters: [], result: "void" },
//     notify: { parameters: ["buffer", "usize"], result: "void" },
//     type_: { parameters: ["buffer", "usize"], result: "void" },
//     screensize_width: { parameters: [], result: "f64" },
//     screenshot: { parameters: ["buffer", "usize"], result: "void" },
//     alert: { parameters: ["buffer", "usize"], result: "void" },
//     mouse_click: { parameters: ["buffer", "usize"], result: "void" },
//     screensize_height: { parameters: [], result: "f64" },
//     mouse_pos_x: { parameters: [], result: "f64" },
//     tap: { parameters: ["buffer", "usize"], result: "void" },
//     mouse_pixel_color_a: { parameters: [], result: "u8" },
//     mouse_pos_y: { parameters: [], result: "f64" },
//   }
// );
