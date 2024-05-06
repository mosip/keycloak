import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { keycloakify } from "keycloakify/vite-plugin";

export default defineConfig({
  plugins: [
    react(), 
    keycloakify({
      themeName: "mosip_keycloak_theme",
      extraThemeProperties: [
        "MY_ENV_VARIABLE=${env.MY_ENV_VARIABLE:}"
      ],
      // In this example, after running `yarn build-keycloak-theme`
      // there will be a `keycloak_dist/foo.txt` file.  
      postBuild: async keycloakifyBuildOptions => {

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
})