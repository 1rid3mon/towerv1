plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
}

android {
    namespace = "com.kulesavunma.app"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.kulesavunma.app"
        minSdk = 23
        targetSdk = 35
        versionCode = 1
        versionName = "0.1.0"
    }
}

dependencies {
    implementation("androidx.webkit:webkit:1.13.0")
    implementation("androidx.activity:activity-ktx:1.10.1")
}

// Copy canonical game files from the repository root into bundled app assets.
val syncGameAssets by tasks.registering(Copy::class) {
    from(rootProject.projectDir.parentFile) {
        include("index.html", "engine.js", "render.js", "ui.js", "data.js")
    }
    into(layout.projectDirectory.dir("src/main/assets/game"))
}

tasks.named("preBuild").configure {
    dependsOn(syncGameAssets)
}
