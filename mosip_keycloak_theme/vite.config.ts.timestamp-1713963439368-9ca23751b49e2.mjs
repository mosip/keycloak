// vite.config.ts
import { defineConfig } from "file:///D:/keycloak/mosip_keycloak_theme/node_modules/vite/dist/node/index.js";
import react from "file:///D:/keycloak/mosip_keycloak_theme/node_modules/@vitejs/plugin-react/dist/index.mjs";
import { keycloakify } from "file:///D:/keycloak/mosip_keycloak_theme/node_modules/keycloakify/vite-plugin/index.js";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    keycloakify({
      themeName: "mosip_keycloak_theme",
      extraThemeProperties: [
        "foo=bar"
      ],
      // In this example, after running `yarn build-keycloak-theme`
      // there will be a `keycloak_dist/foo.txt` file.  
      postBuild: async (keycloakifyBuildOptions) => {
        const fs = await import("fs/promises");
        const path = await import("path");
        await fs.writeFile(
          path.join(keycloakifyBuildOptions.keycloakifyBuildDirPath, "foo.txt"),
          Buffer.from(
            [
              "Created by the postBuild hook of the keycloakify vite plugin",
              "",
              "Resolved keycloakifyBuildOptions:",
              "",
              JSON.stringify(keycloakifyBuildOptions, null, 2),
              ""
            ].join("\n"),
            "utf8"
          )
        );
      }
    })
  ],
  build: {
    sourcemap: true
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJEOlxcXFxrZXljbG9ha1xcXFxtb3NpcF9rZXljbG9ha190aGVtZVwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiRDpcXFxca2V5Y2xvYWtcXFxcbW9zaXBfa2V5Y2xvYWtfdGhlbWVcXFxcdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0Q6L2tleWNsb2FrL21vc2lwX2tleWNsb2FrX3RoZW1lL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSdcbmltcG9ydCByZWFjdCBmcm9tICdAdml0ZWpzL3BsdWdpbi1yZWFjdCdcbmltcG9ydCB7IGtleWNsb2FraWZ5IH0gZnJvbSBcImtleWNsb2FraWZ5L3ZpdGUtcGx1Z2luXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XG4gIHBsdWdpbnM6IFtcbiAgICByZWFjdCgpLCBcbiAgICBrZXljbG9ha2lmeSh7XG4gICAgICB0aGVtZU5hbWU6IFwibW9zaXBfa2V5Y2xvYWtfdGhlbWVcIixcbiAgICAgIGV4dHJhVGhlbWVQcm9wZXJ0aWVzOiBbXG4gICAgICAgIFwiZm9vPWJhclwiXG4gICAgICBdLFxuICAgICAgLy8gSW4gdGhpcyBleGFtcGxlLCBhZnRlciBydW5uaW5nIGB5YXJuIGJ1aWxkLWtleWNsb2FrLXRoZW1lYFxuICAgICAgLy8gdGhlcmUgd2lsbCBiZSBhIGBrZXljbG9ha19kaXN0L2Zvby50eHRgIGZpbGUuICBcbiAgICAgIHBvc3RCdWlsZDogYXN5bmMga2V5Y2xvYWtpZnlCdWlsZE9wdGlvbnMgPT4ge1xuXG4gICAgICAgIGNvbnN0IGZzID0gYXdhaXQgaW1wb3J0KFwiZnMvcHJvbWlzZXNcIik7XG4gICAgICAgIGNvbnN0IHBhdGggPSBhd2FpdCBpbXBvcnQoXCJwYXRoXCIpO1xuXG4gICAgICAgIGF3YWl0IGZzLndyaXRlRmlsZShcbiAgICAgICAgICBwYXRoLmpvaW4oa2V5Y2xvYWtpZnlCdWlsZE9wdGlvbnMua2V5Y2xvYWtpZnlCdWlsZERpclBhdGgsIFwiZm9vLnR4dFwiKSxcbiAgICAgICAgICBCdWZmZXIuZnJvbShcbiAgICAgICAgICAgIFtcbiAgICAgICAgICAgIFwiQ3JlYXRlZCBieSB0aGUgcG9zdEJ1aWxkIGhvb2sgb2YgdGhlIGtleWNsb2FraWZ5IHZpdGUgcGx1Z2luXCIsIFxuICAgICAgICAgICAgXCJcIixcbiAgICAgICAgICAgIFwiUmVzb2x2ZWQga2V5Y2xvYWtpZnlCdWlsZE9wdGlvbnM6XCIsXG4gICAgICAgICAgICBcIlwiLFxuICAgICAgICAgICAgSlNPTi5zdHJpbmdpZnkoa2V5Y2xvYWtpZnlCdWlsZE9wdGlvbnMsIG51bGwsIDIpLFxuICAgICAgICAgICAgXCJcIlxuICAgICAgICAgICAgXS5qb2luKFwiXFxuXCIpLFxuICAgICAgICAgICAgXCJ1dGY4XCJcbiAgICAgICAgICApXG4gICAgICAgICk7XG5cbiAgICAgIH1cbiAgICB9KVxuICBdLFxuICBidWlsZDoge1xuICAgIHNvdXJjZW1hcDogdHJ1ZVxuICB9XG59KSJdLAogICJtYXBwaW5ncyI6ICI7QUFBd1IsU0FBUyxvQkFBb0I7QUFDclQsT0FBTyxXQUFXO0FBQ2xCLFNBQVMsbUJBQW1CO0FBRTVCLElBQU8sc0JBQVEsYUFBYTtBQUFBLEVBQzFCLFNBQVM7QUFBQSxJQUNQLE1BQU07QUFBQSxJQUNOLFlBQVk7QUFBQSxNQUNWLFdBQVc7QUFBQSxNQUNYLHNCQUFzQjtBQUFBLFFBQ3BCO0FBQUEsTUFDRjtBQUFBO0FBQUE7QUFBQSxNQUdBLFdBQVcsT0FBTSw0QkFBMkI7QUFFMUMsY0FBTSxLQUFLLE1BQU0sT0FBTyxhQUFhO0FBQ3JDLGNBQU0sT0FBTyxNQUFNLE9BQU8sTUFBTTtBQUVoQyxjQUFNLEdBQUc7QUFBQSxVQUNQLEtBQUssS0FBSyx3QkFBd0IseUJBQXlCLFNBQVM7QUFBQSxVQUNwRSxPQUFPO0FBQUEsWUFDTDtBQUFBLGNBQ0E7QUFBQSxjQUNBO0FBQUEsY0FDQTtBQUFBLGNBQ0E7QUFBQSxjQUNBLEtBQUssVUFBVSx5QkFBeUIsTUFBTSxDQUFDO0FBQUEsY0FDL0M7QUFBQSxZQUNBLEVBQUUsS0FBSyxJQUFJO0FBQUEsWUFDWDtBQUFBLFVBQ0Y7QUFBQSxRQUNGO0FBQUEsTUFFRjtBQUFBLElBQ0YsQ0FBQztBQUFBLEVBQ0g7QUFBQSxFQUNBLE9BQU87QUFBQSxJQUNMLFdBQVc7QUFBQSxFQUNiO0FBQ0YsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
