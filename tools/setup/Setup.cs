// ORIX-Setup.exe: one file you double-click. It puts ORIX in %LOCALAPPDATA%\Programs\ORIX (no admin rights
// needed), starts it and explains in three lines how it works. The app itself (ORIX-Windows.zip) is inside this exe
// as a resource. Built by tools/make-setup.cjs with the C# compiler that comes with Windows (C# 5, .NET Framework 4).
//
// Test flags: --dir <folder> (install somewhere else), --no-start (don't start ORIX), --quiet (no window, exit when
// done), --shot <png> (draw the "ready" screen into a picture and stop; installs nothing).
using System;
using System.Diagnostics;
using System.Drawing;
using System.IO;
using System.IO.Compression;
using System.Reflection;
using System.Threading;
using System.Windows.Forms;

[assembly: AssemblyTitle("ORIX Setup")]
[assembly: AssemblyProduct("ORIX")]
[assembly: AssemblyCompany("ORIX")]
[assembly: AssemblyVersion("{{ASMVERSION}}")]
[assembly: AssemblyFileVersion("{{ASMVERSION}}")]

static class Setup {
    public const string VERSION = "{{VERSION}}";
    public static string Home = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "Programs", "ORIX");
    public static bool NoStart, Quiet;
    public static string Shot;

    [STAThread]
    static int Main(string[] args) {
        for (int i = 0; i < args.Length; i++) {
            if (args[i] == "--dir" && i + 1 < args.Length) Home = Path.GetFullPath(args[++i]);
            else if (args[i] == "--no-start") NoStart = true;
            else if (args[i] == "--quiet") Quiet = true;
            else if (args[i] == "--shot" && i + 1 < args.Length) Shot = args[++i];
        }
        if (Quiet) {
            try { Installer.Run(Home, null); if (!NoStart) Installer.Start(Home); return 0; }
            catch (Exception e) { Console.Error.WriteLine(e.Message); return 1; }
        }
        Application.EnableVisualStyles();
        Application.SetCompatibleTextRenderingDefault(false);
        var form = new SetupForm();
        if (Shot != null) { // off screen: the window opens far away, draws itself into the picture and closes
            form.StartPosition = FormStartPosition.Manual; form.Location = new Point(-4000, -4000); form.ShowInTaskbar = false;
            form.Show(); form.ShowReady(); Application.DoEvents();
            using (var bmp = new Bitmap(form.Width, form.Height)) { form.DrawToBitmap(bmp, new Rectangle(0, 0, form.Width, form.Height)); bmp.Save(Shot); }
            form.Close(); return 0;
        }
        Application.Run(form);
        return 0;
    }
}

static class Installer {
    /** Requires ORIX to be closed, unpacks the app next to it and swaps it in. progress: 0..1 */
    public static void Run(string home, Action<double> progress) {
        home = Path.GetFullPath(home);
        if (String.Equals(home.TrimEnd(Path.DirectorySeparatorChar, Path.AltDirectorySeparatorChar),
                          Path.GetPathRoot(home).TrimEnd(Path.DirectorySeparatorChar, Path.AltDirectorySeparatorChar), StringComparison.OrdinalIgnoreCase))
            throw new Exception("Choose an installation folder, not a drive root.");
        home = home.TrimEnd(Path.DirectorySeparatorChar, Path.AltDirectorySeparatorChar);
        EnsureNotRunning(home);
        string fresh = home + ".new", old = home + ".old";
        if (Directory.Exists(old) && !Directory.Exists(home))
            throw new Exception("A previous installation backup is at " + old + ". Restore it before running setup again.");
        if (Directory.Exists(fresh)) Directory.Delete(fresh, true);
        Directory.CreateDirectory(fresh);
        string root = Path.GetFullPath(fresh) + Path.DirectorySeparatorChar;
        using (Stream s = Assembly.GetExecutingAssembly().GetManifestResourceStream("ORIX.zip"))
        using (var zip = new ZipArchive(s, ZipArchiveMode.Read)) {
            int n = zip.Entries.Count, done = 0;
            foreach (ZipArchiveEntry e in zip.Entries) {
                string name = e.FullName.Replace('\\', '/');
                if (name.StartsWith("ORIX/")) name = name.Substring("ORIX/".Length);
                done++;
                if (name.Length == 0) continue;
                string dest = Path.GetFullPath(Path.Combine(fresh, name.Replace('/', Path.DirectorySeparatorChar)));
                if (!dest.StartsWith(root, StringComparison.OrdinalIgnoreCase)) throw new Exception("Unsafe path in the package: " + name);
                if (name.EndsWith("/")) { Directory.CreateDirectory(dest); continue; }
                Directory.CreateDirectory(Path.GetDirectoryName(dest));
                e.ExtractToFile(dest, true);
                if (progress != null && (done % 8 == 0 || done == n)) progress(0.95 * done / n);
            }
        }
        if (!File.Exists(Path.Combine(fresh, "ORIX.exe"))) throw new Exception("The package has no ORIX.exe.");
        EnsureNotRunning(home);
        if (Directory.Exists(old)) TryDelete(old);
        if (Directory.Exists(home)) {
            if (!Retry(() => Directory.Move(home, old), () => EnsureNotRunning(home)))
                throw new Exception("ORIX is still running. Quit it from the tray menu next to the clock and try again.");
        }
        // a virus scanner often holds the new files for a moment: try again, and if it never works, put the old ORIX back
        if (!Retry(() => Directory.Move(fresh, home), null)) {
            if (Directory.Exists(old) && !Retry(() => Directory.Move(old, home), null))
                throw new Exception("The previous installation could not be restored. Its backup is at " + old + ". Restore it before running setup again.");
            TryDelete(fresh);
            throw new Exception("Windows kept the new files busy. Wait a moment and run the setup again.");
        }
        TryDelete(old);
        if (progress != null) progress(1);
    }

    static bool Retry(Action act, Action between) {
        for (int i = 0; i < 40; i++) {
            try { act(); return true; } catch { if (between != null) between(); Thread.Sleep(250); }
        }
        return false;
    }

    public static void Start(string home) {
        var p = new ProcessStartInfo(Path.Combine(home, "ORIX.exe")) { WorkingDirectory = home, UseShellExecute = true };
        Process.Start(p);
    }

    static void EnsureNotRunning(string home) {
        string dir = Path.GetFullPath(home) + Path.DirectorySeparatorChar;
        foreach (Process p in Process.GetProcessesByName("ORIX")) {
            bool running = false;
            try { running = p.MainModule.FileName.StartsWith(dir, StringComparison.OrdinalIgnoreCase); } catch { }
            finally { p.Dispose(); }
            if (running) throw new Exception("Quit ORIX from the tray menu before installing, then run setup again.");
        }
    }

    static void TryDelete(string dir) { try { Directory.Delete(dir, true); } catch { } }
}

class SetupForm : Form {
    readonly Label title = new Label(), text = new Label();
    readonly ProgressBar bar = new ProgressBar();
    readonly Button button = new Button();
    readonly PictureBox robo = new PictureBox();
    readonly Color ink = Color.FromArgb(20, 20, 22), muted = Color.FromArgb(110, 110, 118);

    public SetupForm() {
        Text = "ORIX " + Setup.VERSION;
        FormBorderStyle = FormBorderStyle.FixedDialog; MaximizeBox = false;
        StartPosition = FormStartPosition.CenterScreen;
        ClientSize = new Size(540, 360); BackColor = Color.White;
        Font = new Font("Segoe UI", 10.5f);
        try { Icon = Icon.ExtractAssociatedIcon(Application.ExecutablePath); } catch { }
        using (Stream s = Assembly.GetExecutingAssembly().GetManifestResourceStream("orix.png")) { if (s != null) robo.Image = Image.FromStream(s); }
        robo.SizeMode = PictureBoxSizeMode.Zoom; robo.SetBounds(36, 36, 72, 72);
        title.SetBounds(128, 38, 380, 34); title.Font = new Font("Segoe UI Semibold", 17f); title.ForeColor = ink; title.Text = "Installing ORIX";
        text.SetBounds(130, 76, 376, 40); text.ForeColor = muted; text.Text = "This takes a few seconds.";
        bar.SetBounds(36, 140, 468, 8); bar.Maximum = 1000; bar.Style = ProgressBarStyle.Continuous;
        button.SetBounds(384, 300, 120, 36); button.Text = "Got it"; button.Visible = false;
        button.FlatStyle = FlatStyle.Flat; button.FlatAppearance.BorderSize = 0; button.BackColor = ink; button.ForeColor = Color.White;
        button.Font = new Font("Segoe UI Semibold", 10.5f); button.Cursor = Cursors.Hand;
        button.Click += delegate { Close(); };
        Controls.AddRange(new Control[] { robo, title, text, bar, button });
        AcceptButton = button;
        Shown += delegate { if (Setup.Shot == null) new Thread(Work) { IsBackground = true }.Start(); };
    }

    void Work() {
        try {
            Installer.Run(Setup.Home, p => BeginInvoke((Action)(() => bar.Value = (int)(p * 1000))));
            if (!Setup.NoStart) Installer.Start(Setup.Home);
            BeginInvoke((Action)ShowReady);
        } catch (Exception e) {
            BeginInvoke((Action)(() => {
                title.Text = "Something went wrong"; text.Height = 120;
                text.Text = e.Message + "\n\nTry again and check the ORIX release documentation.";
                bar.Visible = false; button.Text = "Close"; button.Visible = true;
            }));
        }
    }

    public void ShowReady() {
        title.Text = "ORIX is ready";
        text.Text = "Your desktop layer is ready at the top of your screen.";
        bar.Visible = false;
        var steps = new Label();
        steps.SetBounds(36, 140, 470, 150); steps.ForeColor = ink; steps.Font = new Font("Segoe UI", 11f);
        steps.Text = "1.   Show or hide the desktop layer from Overview or the tray menu.\n\n"
          + "2.   Connect Claude Code or Codex in Settings → Connections.\n\n"
          + "3.   Install updates manually from trusted ORIX releases.";
        Controls.Add(steps);
        button.Visible = true; button.Focus();
    }
}
