param([string]$Classeur = (Join-Path $PSScriptRoot '../Catalogue-vegetaux.xlsx'))
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.IO.Compression.FileSystem
$racine = Split-Path $PSScriptRoot -Parent
$archive = [IO.Compression.ZipFile]::OpenRead((Resolve-Path -LiteralPath $Classeur))
function Lire-Xml([string]$Chemin) {
    $entree = $archive.GetEntry($Chemin)
    if (!$entree) { throw "Élément Excel absent $Chemin" }
    $lecteur = [IO.StreamReader]::new($entree.Open())
    try { return ,([xml]$lecteur.ReadToEnd()) } finally { $lecteur.Dispose() }
}
function Texte-Xml($Noeud) {
    return (($Noeud.SelectNodes('.//*[local-name()="t"]') | ForEach-Object { $_.InnerText }) -join '')
}
try {
    $chaines = @()
    if ($archive.GetEntry('xl/sharedStrings.xml')) {
        $xml = Lire-Xml 'xl/sharedStrings.xml'
        $chaines = @($xml.SelectNodes('//*[local-name()="si"]') | ForEach-Object { Texte-Xml $_ })
    }
    $livre = Lire-Xml 'xl/workbook.xml'
    $feuille = $livre.SelectNodes('//*[local-name()="sheet"]') | Where-Object { $_.name -eq 'Catalogue parking' }
    $formatCatalogue = [bool]$feuille
    if (!$feuille) { $feuille = $livre.SelectNodes('//*[local-name()="sheet"]') | Where-Object { $_.name -eq 'Sélection parking' } }
    if (!$feuille) { throw 'Onglet Catalogue parking ou Sélection parking introuvable.' }
    $relationId = $feuille.GetAttribute('id', 'http://schemas.openxmlformats.org/officeDocument/2006/relationships')
    $relations = Lire-Xml 'xl/_rels/workbook.xml.rels'
    $cible = ($relations.Relationships.Relationship | Where-Object { $_.Id -eq $relationId }).Target
    $chemin = if ($cible.StartsWith('/')) { $cible.TrimStart('/') } else { 'xl/' + $cible }
    $contenu = Lire-Xml $chemin
    $lignes = @()
    foreach ($ligne in $contenu.SelectNodes('//*[local-name()="sheetData"]/*[local-name()="row"]')) {
        $cellules = @{}
        foreach ($cellule in $ligne.SelectNodes('./*[local-name()="c"]')) {
            $colonne = $cellule.r -replace '[0-9]', ''
            $valeur = $cellule.SelectSingleNode('./*[local-name()="v"]')
            $texte = if ($cellule.t -eq 's') { $chaines[[int]$valeur.InnerText] }
                elseif ($cellule.t -eq 'inlineStr') { Texte-Xml $cellule }
                elseif ($valeur) { $valeur.InnerText } else { '' }
            $cellules[$colonne] = [string]$texte
        }
        if ($formatCatalogue) {
            if ($cellules.H -in @('Arbre', 'Vivace') -and $cellules.A) { $lignes += ,$cellules }
        } elseif ($cellules.B -in @('Arbre', 'Vivace') -and $cellules.D) { $lignes += ,$cellules }
    }
} finally { $archive.Dispose() }
if (!$lignes.Count) { throw 'Aucun végétal dans la sélection parking.' }
if ($formatCatalogue) {
    $ordre = @('H','A','S','C','D','R','F','I','L','T','O','P','Q','K','E','B','G','M','J','N')
    $sortie = @('Catalogue parking — sélection Excel et compléments Floriscope', 'Groupe;Nom scientifique;Nom vernaculaire;Exposition;Humidité du sol;Type de rendu;Mois de floraison;Hauteur adulte;Conseil parking;Source des besoins;Pollinisateurs;Source écologie;Espèce pour la diversité;Zone conseillée;Sous-catégorie horticole;Nom(s) vernaculaire(s);Catégorie horticole;Fiche Floriscope;Largeur adulte;Source du catalogue initial')
    foreach ($ligne in $lignes) {
        $sortie += ($ordre | ForEach-Object { ([string]$ligne[$_] -replace ';', ',' -replace '[\r\n]+', ' ').Trim() }) -join ';'
    }
    $csv = ($sortie -join "`n") + "`n"
    $utf8 = [Text.UTF8Encoding]::new($false)
    [IO.File]::WriteAllText((Join-Path $racine 'data/API_plantes.csv'), $csv, $utf8)
    [IO.File]::WriteAllText((Join-Path $racine 'data/plantes-embarquees.js'), ('// Catalogue identique en ligne et hors serveur.' + "`nwindow.CSV_PLANTES = " + (ConvertTo-Json -InputObject $csv -Compress) + ";`n"), $utf8)
    Write-Output "Catalogue enrichi synchronisé depuis l’Excel, $($lignes.Count) végétaux."
    return
}
$enrichissement = Get-Content -Raw -LiteralPath (Join-Path $racine 'data/ecologie-plantes.json') -Encoding UTF8 | ConvertFrom-Json
$mois = @('janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre')
function Floraison([string]$Texte) {
    $texte = $Texte.ToLowerInvariant().Trim()
    if ($texte -match '^([a-zéû]+) à ([a-zéû]+)$') {
        $debut = [array]::IndexOf($mois, $Matches[1]); $fin = [array]::IndexOf($mois, $Matches[2])
        if ($debut -ge 0 -and $fin -ge $debut) { return $mois[$debut..$fin] -join ', ' }
    }
    return (($texte -split ',' | ForEach-Object { $_.Trim() } | Where-Object { $_ -in $mois }) -join ', ')
}
function Humidite([string]$Texte) {
    $texte = $Texte.ToLowerInvariant()
    if ($texte -match 'frais à humide') { return 'frais, humide' }
    if ($texte -match 'humide à mouillé') { return 'humide, très humide' }
    $trouvees = @('très humide','humide','frais','très sec','sec') | Where-Object { $texte -match "(?<![\p{L}])$_(?![\p{L}])" }
    if ($trouvees) { return $trouvees -join ', ' }
    if ($texte -match 'drainé') { return 'frais, sec' }
    return ''
}
$sortie = @('Catalogue issu de API_végétaux.xlsx — Sélection parking', 'Groupe;Nom scientifique;Nom vernaculaire;Exposition;Humidité;Type;Floraison;Hauteur;Note;Source;Pollinisateurs;Source écologie;Espèce;Zone conseillée')
foreach ($ligne in $lignes) {
    $info = $enrichissement.PSObject.Properties[$ligne.D].Value
    $floraison = if ($info.floraison) { $info.floraison } else { Floraison $ligne.H }
    $pollinisateurs = if ($info.pollinisateurs -eq $true) { 'documenté' } else { 'non documenté' }
    $espece = ($ligne.D -split "['‘’]")[0].Trim().ToLowerInvariant() -replace ' subsp\..*$', ''
    $type = if ($ligne.D -match '^(Festuca|Carex|Juncus) ') { 'Vivace graminiforme' } else { $ligne.B }
    $colonnes = @($ligne.B,$ligne.D,$ligne.C,($ligne.E.ToLowerInvariant() -replace 'mi-ombre légère','mi-ombre'),(Humidite $ligne.F),$type,$floraison,$ligne.G,$ligne.I,$ligne.K,$pollinisateurs,$info.source,$espece,$ligne.A)
    $sortie += ($colonnes | ForEach-Object { ([string]$_ -replace ';', ',' -replace '[\r\n]+', ' ').Trim() }) -join ';'
}
$csv = ($sortie -join "`n") + "`n"
$utf8 = [Text.UTF8Encoding]::new($false)
[IO.File]::WriteAllText((Join-Path $racine 'data/API_plantes.csv'), $csv, $utf8)
[IO.File]::WriteAllText((Join-Path $racine 'data/plantes-embarquees.js'), ('// Même catalogue pour le lancement hors ligne.' + "`nwindow.CSV_PLANTES = " + (ConvertTo-Json -InputObject $csv -Compress) + ";`n"), $utf8)
Write-Output "Catalogue synchronisé depuis l’Excel, $($lignes.Count) végétaux. Les données écologiques non vérifiées restent non documentées."
