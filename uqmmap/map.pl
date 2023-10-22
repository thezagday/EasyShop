#!/usr/bin/perl -w
# Copyright (c) 2008, Rob Bloom
# All rights reserved.
#
# Redistribution and use in source and binary forms, with or without
# modification, are permitted provided that the following conditions are met:
#     * Redistributions of source code must retain the above copyright
#       notice, this list of conditions and the following disclaimer.
#     * Redistributions in binary form must reproduce the above copyright
#       notice, this list of conditions and the following disclaimer in the
#       documentation and/or other materials provided with the distribution.
#     * Neither the name of the <organization> nor the
#       names of its contributors may be used to endorse or promote products
#       derived from this software without specific prior written permission.
#
# THIS SOFTWARE IS PROVIDED BY ROB BLOOM ''AS IS'' AND ANY
# EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
# WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
# DISCLAIMED. IN NO EVENT SHALL ROB BLOOM BE LIABLE FOR ANY
# DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
# (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
# LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
# ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
# (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
# SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
#

# Additional changes, Copyright (c) 2010, Alan De Smet, released under
# the same license above.

# TODO:
# - Option: Use real greek symbols
# - redo borders
# - Check constellation repel code; appears to use too small of an area
# - Use real Shading object for gradiant instead of hand-rolling
# - Make sparkle a constant, large size. Small ones disappear.

use strict;
use PDF::API2;
use Getopt::Long;

my $PI = 3.1415926535897932384626;

my $outfile = 'starmap.pdf';

my %colors;

# Number of steps for the glows. More looks better, but makes bigger files.
my $glow_steps = 6;

# Size of title ("Ur-Quan Masters Map of HyperSpace");
my $h1size = 24; 
# Size of subheadings ("Legend" and "List of stars");
my $h2size = 10; 

# Font size for list of starts
my $star_list_size = 3.1;

# Number of columns for list of stars
my $star_list_cols = 4;

# Spacing between entries in star list.
my $star_list_step = $star_list_size*1.071428;

my $spheres = 'historic';

my $pagemargin=.25*72;

# 1=bold, 0=normal
my(@credits) = (
	['Map design by', 1],
	['Rob Bloom', 0],
	['Alan De Smet', 0],
	['Based on', 1],
	['The Ur-Quan Masters', 0],
	['copyright 2002', 0],
	['Paul Reiche', 0],
	['Fred Ford', 0],
);

my $default_colorset = 'black';
my $BLACK = [0,0,0];
my $WHITE = [1,1,1];
my $YELLOW = [1,1,0];
my %colors_preset = (
white => {
	background       => $WHITE,
	title            => $BLACK,
	star_list_title  => $BLACK,
	star_list        => $BLACK,
	legend_title     => $BLACK,
	legend_text      => $BLACK,
	example_planet   => $BLACK,
	grid_numbers     => [0.50, 0.50, 0.50],
	grid             => [0.80, 0.80, 0.80],
	borders          => [0.65, 0.65, 0.65],
	star_blue        => [0.00, 0.00, 1.00],
	star_green       => [0.00, 1.00, 0.00],
	star_orange      => [1.00, 0.50, 0.00],
	star_red         => [1.00, 0.00, 0.00],
	star_white       => [0.70, 0.70, 0.70],
	star_yellow      => [0.90, 0.90, 0.00],
	star_example     => $BLACK,
	feature_sparkle  => $BLACK,
	greek_label      => [0.30, 0.30, 0.30],
	constellation_name=>[0.20, 0.20, 0.20],
	constellation_line=>[0.65, 0.65, 0.65],
	race_sphere      => [1.00, 0.00, 0.00],
},
black => {
	background       => $BLACK,
	title            => $WHITE,
	star_list_title  => [0.80, 0.80, 0.80],
	star_list        => [0.80, 0.80, 0.80],
	legend_title     => [0.80, 0.80, 0.80],
	legend_text      => $WHITE,
	example_planet   => $WHITE,
	grid_numbers     => [0.80, 0.80, 0.80],
	grid             => [0.20, 0.20, 0.20],
	route            => $YELLOW,
	borders          => [0.65, 0.65, 0.65],
	star_blue        => [0.30, 0.30, 1.00],
	star_green       => [0.30, 1.00, 0.30],
	star_orange      => [1.00, 0.50, 0.00],
	star_red         => [1.00, 0.00, 0.00],
	star_white       => $WHITE,
	star_yellow      => [1.00, 1.00, 0.00],
	star_example     => $WHITE,
	feature_sparkle  => $WHITE,
	greek_label      => [0.50, 0.50, 0.50],
	constellation_name=>[0.80, 0.80, 0.80],
	constellation_line=>[0.25, 0.25, 0.25],
	race_sphere      => [1.00, 0.20, 0.20],
},
);

my(%size_map) = (
	DWARF_STAR => 1.00,
	GIANT_STAR => 2.00,
	SUPER_GIANT_STAR => 3.00,
);


# Used to verify that all additional and replaced links were used.
my %used_links;

# Additional links to draw for constellations
my(%additional_links) = (
	Apodis     => [qw(a d)],
	Arianni    => [qw(a g)],
	Capricorni => [qw(a g)],
	Circini    => [qw(a z)],
	Crucis     => [qw(a d)],
	Eridani    => [qw(a g)],
	Geminorum  => [qw(b d)],
	Gorno      => [qw(a ep)],
	Kepler     => [qw(a g)],
	Lacaille   => [qw(a g)],
	Lalande    => [qw(a g)],
	Olber      => [qw(a g)],
	Ophiuchi   => [qw(a g)],
	Pictoris   => [qw(a g)],
	Puppis     => [qw(a g)],
	Sagittae   => [qw(a g)],
	Saurus     => [qw(a g)],
	Squidi     => [qw(a g)],
	Telescopii => [qw(a g)],
	Trianguli  => [qw(a g)],
	Tucanae    => [qw(a g)],
);

# Replace the default constellations with these
my(%replace_links) = (
	Corvi => [[qw(ep g z b et d)]],
	Muscae => [[qw(d z ep d a b g)]],
	Chandrasekhar => [[qw(g a d ep b g)]],
	Cygnus => [[qw(ep b d g a b)]],
	Tauri => [[qw(b g ep z a d)], [qw(a g)]],
	Bootis => [[qw(et g z ep a b g)], [qw(a d)]],
	Volantis => [[qw(g a b g d z et ep z)]],
	Krueger => [[qw(z a ep d b g a)]],
	Giclas => [ [qw(et g a b ep t)], [qw(z d a)] ],
	Orionis => [ [qw(z d ep)], [qw(d g b a d)], [qw(et t i)], [qw(t a)], [qw(k l m)], [qw(l b)] ],
	Gruis => [[qw(b a g d ep z et d)]],
	Illuminati => [[qw(t et z ep g b a d)]],
	Centauri => [[qw(g a ep z b d)]],
	Ptolemae => [[qw(et z ep)],[qw(z a b g d b)]],
	Raynet => [[qw(b a g)]],
	Vitalis => [[qw(b a g d a)]],
	Ceti => [[qw(d et b g d a z ep)]],
	Draconis => [[qw(k n m k x z b a d l g ep t i et t)]],
	Antliae => [[qw(d g b a z ep b)]],
	Carinae => [[qw(b g a)]],
	Cassiopeiae => [[qw(ep d g a b d)]],
	Lentilis => [[qw(g a d b a)]],
	Vulpeculae => [ [qw(z a ep)], [qw(d a g)], [qw(b a et)]],
	Mira => [[qw(d a b g a)]],
	Sextantis => [[qw(a b z ep d g)]],
	Serpentis => [[qw(i t et d b ep g a z)]],
	Scuti => [[qw(b a d z ep g)]],
	Cancri => [[qw(a g d b g)]],
	Lentilis => [[qw(g a d b a)]],
	Lyncis => [[qw(z ep a b et t)],[qw(b g d a)]],
	Lipi => [[qw(d g a b ep)]],
	Fornacis => [[qw(a b g d ep et)],[qw(ep z)]],
	Crateris => [[qw(t g d ep et z)],[qw(a b d)]],
	Camelopardalis => [[qw(et z a b t ep a g d i)]],
	Copernicus => [[qw(a g)]],
	Brahe => [[qw(a b z ep g d ep)]],
	Scorpii => [[qw(d ep z g b a)]],
	Sculptoris => [[qw(ep a g)],[qw(a d)]],
	Reticuli => [[qw(b a g)],[qw(a d)]],
	Horologii => [[qw(a b g d ep z a et t i k l a)]],
	Hyades => [[qw(g b a d g ep z et t i k l)]],
	Librae => [[qw(a b g d z et ep d)]],
	Aquarii => [[qw(et a z ep b d g a)]],
	Aquilae => [[qw(ep a b)], [qw(d a g)]],
	Piscium => [[qw(a g b d g)]],
	Persei => [[qw(i ep et)],[qw(ep a t)],[qw(d g a b z a)]],
	Arae => [[qw(b a ep d a g)]],
);

sub sphere_from_extents {
	my($e, $w, $n, $s) = @_;
	if($e<$w) { ($e,$w) = ($w,$e) }
	if($n<$s) { ($n,$s) = ($s,$n) }
	my $x = ($w+$e)/2;
	my $y = ($n+$s)/2;
	my $dx = $e-$w;
	my $dy = $n-$s;
	my $davg = (($dx+$dy)/2); # Average in hopes it's closer to correct.
	my $radius = $davg/2;
	# Why *10? To match spheres_modern, which is drawn from actual source.
	return($x*10,$y*10,$radius*10);
}

# Generated using extract-spheres.pl
my(@spheres_modern) = (
	[ "Androsynth"  ,    0,    0,    0,  0,  0 ],
	[ "Arilou"      ,  438, 6372,  250,  0,  0,  90 ],
	[ "Chenjesu"    ,    0,    0,    0,  0,  0 ],
	[ "Chmmr"       ,    0,    0,    0,  0,  0 ],
	[ "Druuge"      , 9500, 2792, 1400,  0, 20, 120 ],
	[ "Earthling"   , 1752, 1450,    0,  0,-10,   0 ],
	[ "Ilwrath"     ,   48, 1700, 1410, 25,  0,  60 ],
	[ "Kohr-Ah"     , 6000, 6250, 2666,110,220,  80 ],
	[ "Lastbat"     ,    0,    0,    0,  0,  0 ],
	[ "Melnorme"    ,    0,    0,    0,  0,  0 ],
	[ "Mmrnmhrm"    ,    0,    0,    0,  0,  0 ],
	[ "Mycon"       , 6392, 2200, 1070,-50,  0,  80 ],
	[ "Orz"         , 3608, 2637,  333,-40,-20,  45 ],
	[ "Pkunk"       ,  502,  401,  666,  0,-35,  20 ],
	[ "Probe"       ,    0,    0,    0,  0,  0 ],
	[ "Shofixti"    ,    0,    0,    0,  0,  0 ],
	[ "Sis_ship"    ,    0,    0,    0,  0,  0 ],
	[ "Slylandro"   ,  333, 9812,    0, 10, 10, 180 ],
	[ "Spathi"      , 2549, 3600, 1000,  0, -8, 120 ],
	[ "Supox"       , 7468, 9246,  333, 10, 15, 120 ],
	[ "Syreen"      ,    0,    0,    0,  0,  0 ],
	[ "Thraddash"   , 2535, 8358,  833,-40,-25, 120 ],
	[ "Umgah"       , 1798, 6000,  833,  0, 50,  90 ],
	[ "Ur-Quan"     , 5750, 6000, 2666,-150,-200, 80 ],
	[ "Utwig"       , 8534, 8797,  666, 25, 20,  45 ],
	[ "VUX"         , 4412, 1558,  900, 20,  0,  90 ],
	[ "Yehat"       , 4970,   40,  750,-25, 50,  80 ],
	[ "Zoq-Fot-Pik" , 3761, 5333,  320,  0,-40,   0 ],
);

# Mapped by hand from official map.
my(@spheres_historic) = (
	['Unknown',   sphere_from_extents( 355, 210, 921, 775), 50, 20,  90], # Surrounds Antliae, Apodis, all Draconis but rightmost
	['Umgah',     sphere_from_extents( 230, 135, 660, 560),-20, 10,  45], # Surrounds Orionis only.
	['Spathi',    sphere_from_extents( 340, 140, 465, 270),  0, 75, 120], # All of Squidi, Gruis, Herculis, Vitalis, Illuminati, all but north 2 of Ceti
	['Ilwrath',   sphere_from_extents(  45, -60, 410, 305), 30,-25,  30], # Tauri, leftmost of Virginis, touches Mmrnmhrn
	['Mmrnmhn',   sphere_from_extents( 120,  25, 345, 248),  0, 10, 120], # Misses left and right Virginis, touches Ilwrath, misses leftmost 3 of Bootis
	['Chenjesu',  sphere_from_extents( 130,  10, 280, 155),  0,-10,  45], # All Voltanis, Olber Procyon. Bottom Bootis.
	['Earthling', sphere_from_extents( 220, 130, 180, 100),-20,-10,  90], # All Wolf, Lyrae, Canopus. NWmost of Centauri.
	['Unknown',   sphere_from_extents(  90,  20,  80,  10), 10, 40, 110], # Topmost Giclas barely in. Pkunk
	['Shofixti',  sphere_from_extents( 320, 250,  55, -30),  0, 30, 110], # Gorno + some.
	['Androsynth',sphere_from_extents( 420, 320, 315, 220), 40,-30, 150], # Barely bottom Mensae, top 3 Mira.
	['VUX',       sphere_from_extents( 490, 375, 220,  90),  0,-25,  45], # All Cerenkov, Indi. 2 of Sextantis
	['Mycon',     sphere_from_extents( 675, 570, 290, 180),-30,  0,  45], # Middle Copernicus is on line, as is southmost 2 Scorpii
	['Unknown',   sphere_from_extents(1020, 870, 350, 200),  0, 30, 180], # Algol in. All Persei in. Southmost Persei just in.
	['Yehat',     sphere_from_extents( 600, 390, 110,-100),  0, 70,  80], # Touches Yehat. Bottom 3 of Sextantis
);


# Constellations where the normal repel doesn't land them well. 
my(%constellation_shift) = (
	Chandrasekhar => [ 0.0,  1.0],#          $y += 1;
	Sol           => [-2.0,  0.0],# $x -= 2;
	Vega          => [ 3.0, -2.0],# $x += 3; $y -= 2;
	Corvi         => [-2.0, -1.0],# $x -= 2; $y -= 1;
	Apodis        => [-1.0, -0.5],# $x -= 1; $y -= .5;
	Draconis      => [ 1.0,  0.25],#$x += 1; $y += .25;
	Fornacis      => [ 0.0,  1.0],#          $y += 1;
	Eridani       => [-1.0,  0.5],# $x -= 1; $y -= .5;
	Chamaeleonis  => [ 2.0, -0.5],# $x += 2; $y -= .5;
	Capricorni    => [-0.5, -0.1],# $x -= .5;$y += .1;
	Sagittae      => [ 0.0, -1.0],#          $y -= 1;
	Illuminati    => [ 0.0, -1.0],#          $y -= 1;
	Vulpeculae    => [ 1.0,  0.0],# $x += 1;
	Vela          => [ 0.0, -1.0],#          $y -= 1;
);

my @symbols = ('a','b','g', 'd', 'ep', 'z', 'et', 't', 'i', 'k', 'l', 'm', 'n', 'x',);

my $fill_stars = 1;
my $glow_stars = 1;
my $spoil_stars = 0;
my $spoilers = 0;
my $quiet = 0;

{
	my $colorset = $default_colorset;
	my $printer_friendly = 0;
	my(%color_options);
	foreach my $type (keys %{$colors_preset{$default_colorset}}) {
		my $option = "color-$type=s";
		$option =~ s/_/-/g;
		$color_options{$option} = \&set_color;
	}
	my $ret = GetOptions(
		"output|o=s" => \$outfile,
		"help|h|?" => \&usage_and_exit,
		"colorset|c=s" => \$colorset,
		"fill-stars!" => \$fill_stars,
		"glow-stars!" => \$glow_stars,
		"printer-friendly|p" => \$printer_friendly,
		"mark-notable-stars!" => \$spoil_stars,
		"spoilers!" => \$spoilers,
		"spheres=s" => \$spheres,
		"quiet" => \$quiet,
		%color_options
		);
	if($spoilers) {
		$spoil_stars = 1;
		$spheres = 'modern';
	}
	if(not $ret) {
		usage_and_exit("Unable to parse arguments. Aborting.");
	}
	if($printer_friendly) { $colorset = 'white'; }
	if($spheres eq 'none') { $spheres = ''; }
	if($spheres ne 'modern' and $spheres ne 'historic' and $spheres ne '') {
		usage_and_exit("Invalid spheres entry.");
	}

	if(exists $colors_preset{$colorset}) {
		foreach my $key (keys %{$colors_preset{$colorset}}) {
			if(not defined $colors{$key}) {
				$colors{$key} = $colors_preset{$colorset}{$key};
			}
		}
	} else {
		usage_and_exit("Invalid colorset $colorset.");
	}

}

my(%color_map) = (
	BLUE_BODY => $colors{star_blue},
	GREEN_BODY => $colors{star_green},
	ORANGE_BODY => $colors{star_orange},
	RED_BODY => $colors{star_red},
	WHITE_BODY => $colors{star_white},
	YELLOW_BODY => $colors{star_yellow},
	EXAMPLE => $colors{star_example},
);
my(%color_name_map) = (
	BLUE_BODY => 'Blue',
	GREEN_BODY => 'Green',
	ORANGE_BODY => 'Orange',
	RED_BODY => 'Red',
	WHITE_BODY => 'White',
	YELLOW_BODY => 'Yellow', 
	EXAMPLE => 'Example',
);
my(%size_name) = (
	DWARF_STAR => 'Dwarf',
	GIANT_STAR => 'Giant',
	SUPER_GIANT_STAR => 'Super-Giant',
);
my(@color_order) = qw(RED_BODY ORANGE_BODY YELLOW_BODY GREEN_BODY BLUE_BODY WHITE_BODY);

my %stars;
my %constellations;

my @rainbow = (
	[1,0,0],
	[1,.5,0],
	[1,1,0],
	[0,1,0],
	[0,.5,1],
	[0,0,1],
	[.5,0,1],
	[1,0,1]
);

my @starnames;
my @starnums;

my @strings;
open DAT, "<starcon.txt" or die "Cannot open strings file!";
while (<DAT>) {
	if (/^\#\((.*)\)$/) {
		push @strings, $1;
	}
}
close DAT;

my $star_string_count = 133;
my $star_number_base = ( 133 + 29 + 10 + 133 + 56);
my $star_number_count = 14;

for ( ($star_number_base) .. ($star_number_base+$star_number_count-1) ) {
	push @starnums, $strings[$_];
}

for ( 0 .. ($star_string_count-1) ) {
	push @starnames, $strings[$_];
}


open DAT, "<plandata.c" or die "Cannot open planetary data file!";
my $isstardat = 0;

while (<DAT>) {
	if (!$isstardat) {
		if (/^STAR_DESC starmap_array/) {
			$isstardat = 1;
		}
	} else { # $isstardat
		if (/QuasiSpace/) {
			$isstardat = 0;
		}
		if (/\{\{(.*)\}, MAKE_STAR \((.*)\), (.*)\}/) {
			my ($coord, $info, $name) = ($1, $2, $3);
			$coord =~ /(.*), (.*)/;
			my ($x,$y) = ($1,$2);
			$info =~ /(.*), (.*), -1/;
			my ($size, $color) = ($1,$2);
			$name =~ /(.*), (.*), (.*)/;
			my ($interest, $prefix, $postfix) = ($1,$2,$3);

			my $name2 = toname($prefix,$postfix);
			$stars{$name2} = {
				x=>$x,
				y=>$y,
				size=>$size,
				color=>$color,
				interest=>$interest,
				pre=>$prefix,
				post=>$postfix,
			};

			push @{$constellations{$postfix}}, [$x, $y];
		}
	}
}

validate_replace_links(%replace_links);

# Data loaded!  Now to generate interesting stuff.

progress("Drawing map!\n");

my $pdf = PDF::API2->new(-file => $outfile);

$pdf->info(
	Title => 'EasyShop',
	Author => 'Roman Zagday',
	CreationDate => scalar localtime,
);

my $w = int 8*72;
my $h = int 8.5*72;

$pdf->mediabox($w, $h);

my $page = $pdf->page;
my $gfx = $page->gfx;

my $font=$pdf->corefont('Helvetica', -encode=>'latin1');
my $fontbold=$pdf->corefont('Helvetica-Bold', -encode=>'latin1');
my $fontbolditalic=$pdf->corefont('Helvetica-BoldOblique', -encode=>'latin1');

#progress("Clearing background...\n");
if($colors{background}[0] != 1 or
	$colors{background}[1] != 1 or
	$colors{background}[2] != 1) {
	$gfx->fillcolor(@{$colors{background}});
	$gfx->rect(0,0,$w,$h);
	$gfx->fill();
}

my $mapstartx = $pagemargin+4;
my $mapstarty = $pagemargin+4;
my $mapsize = 530;

# Grid
progress("Drawing grid...\n");
$gfx->linewidth(0.9);
$gfx->strokecolor(@{$colors{grid}});
for (my $x = 0; $x < 10000; $x += 500) {
	my ($dx,$dy) = unitomap($x,0);
	$gfx->move($dx,$dy);
	($dx,$dy) = unitomap($x,10000);
	$gfx->line($dx,$dy);
}
for (my $y = 0; $y < 10000; $y += 500) {
	my ($dx,$dy) = unitomap(0,$y);
	$gfx->move($dx,$dy);
	($dx,$dy) = unitomap(10000,$y);
	$gfx->line($dx,$dy);
}

$gfx->stroke();
$gfx->endpath();


# Arrangement
progress("Drawing racks...\n");

# Line 1
draw_rect($gfx, 500, 9500);
draw_rect($gfx, 3000, 9500);
draw_rect($gfx, 5500, 9500);
draw_rect($gfx, 8000, 9500);

# Line 2
draw_rect($gfx, 500, 7000);
draw_rect($gfx, 3000, 7000);
draw_rect($gfx, 5500, 7000);
draw_rect($gfx, 8000, 7000);

# Line 3
draw_rect($gfx, 500, 4500);
draw_rect($gfx, 3000, 4500);
draw_rect($gfx, 5500, 4500);
draw_rect($gfx, 8000, 4500);

# Line 4
draw_rect($gfx, 500, 2000);
draw_rect($gfx, 3000, 2000);
draw_rect($gfx, 5500, 2000);
draw_rect($gfx, 8000, 2000);


# Spheres
# We do this after grid because we want it on top of the grid, but before 
# everything else because we'll cover over edges with black.
#my @spheres;
#if($spheres eq 'modern') {
#	progress("Drawing modern spheres of influence...\n");
#	@spheres = @spheres_modern;
#} elsif($spheres eq 'historic') {
#	progress("Drawing historic spheres of influence...\n");
#	@spheres = @spheres_historic;
#} else {
#	progress("Skipping spheres of influence...\n");
#}
#foreach my $entry (@spheres) {
#	my($race, $xorig, $yorig, $rorig, $label_offset_x, $label_offset_y, $label_rotate) = @{$entry};
#	if(not defined $label_offset_x) { $label_offset_x = 0; }
#	if(not defined $label_offset_y) { $label_offset_y = 0; }
#	$label_offset_x = gametomap_linear($label_offset_x);
#	$label_offset_y = gametomap_linear($label_offset_y);
#	$xorig /= 10;
#	$yorig /= 10;
#	$rorig /= 10;
#	if($xorig == $yorig and $xorig == 0) { next; }
#	if($rorig == 0) { $rorig = 5; }
#	my($x,$y) = gametomap_xy($xorig, $yorig);
#	my($r) = gametomap_linear($rorig);
#	drawcircle($gfx, $x, $y, $r, @{$colors{race_sphere}}, 0.35, 0);
#	$gfx->endpath();
#
#	$gfx->textstart();
#	my $influence_font_size = 5;
#	$gfx->font($fontbolditalic, $influence_font_size);
#	$gfx->fillcolor(@{$colors{race_sphere}});
#	if(not defined $label_rotate) { $label_rotate = 120; }
#	circle_text($gfx, $x, $y, $r+2, $label_rotate, $influence_font_size, $race);
#	$gfx->textend();
#}
#
#progress("Concealing spheres outside map...\n");
#$gfx->fillcolor(@{$colors{background}});
#$gfx->rect(0,0,$w,$mapstartx);
#$gfx->fill();
#$gfx->rect(0,0,$mapstarty,$h);
#$gfx->fill();
#$gfx->rect($mapstartx+$mapsize,0,$w,$h);
#$gfx->fill();
#$gfx->rect(0,$mapstarty+$mapsize,0,$w,$h);
#$gfx->fill();

# Number Grid
progress("Numbering grid...\n");
for (my $x = 0; $x < 10000; $x += 500) {
	my($dx,$dy) = unitomap($x,10000);
	$gfx->textlabel($dx, $mapstarty+$mapsize+3, $font, 4, int($x/10), -align=>'center', -color=>$colors{grid_numbers});
	$gfx->textlabel($dx, $mapstarty-4-2, $font, 4, int($x/10), -align=>'center', -color=>$colors{grid_numbers});
}
for (my $y = 0; $y < 10000; $y += 500) {
	my($dx,$dy) = unitomap(10000,$y);
	$gfx->textlabel($mapstartx-3, $dy-2, $font, 4, int($y/10), -align=>'right', -color=>$colors{grid_numbers});
	$gfx->textlabel($mapstartx+$mapsize+3, $dy-2, $font, 4, int($y/10), -align=>'left', -color=>$colors{grid_numbers});
}

progress("Drawing title...\n");
$gfx->textlabel($pagemargin, $h-$h1size-$pagemargin, $fontbold, $h1size, "EasyShop", -align=>'left', -color=>$colors{title});


progress("Drawing map border...\n");
draw_border($gfx,$mapstartx-1, $mapstarty-1, $mapsize+2, $mapsize+2);



# TODO REMOVE?
#progress("Drawing list of stars...\n");
#my $liststartx = $mapstartx + $mapsize + $pagemargin;
#my $listwidth = $w - $liststartx - $pagemargin;
#my $list_offset = 62;
#my $listheight = $h - $pagemargin*2 - $list_offset;
#my $liststarty = $pagemargin + $list_offset;
##
#draw_border($gfx, $liststartx-1,$liststarty-1, $listwidth+2,$listheight+2);
#
#$gfx->textlabel( $liststartx + 2, $liststarty + $listheight-$h2size, $fontbold,$h2size, "List of stars", -color=>$colors{star_list_title});
#
#my $x = $liststartx+2;
#my $yreset = $liststarty + $listheight - 8;
#my $y = $yreset - $star_list_step*2;
#my $colnum = 1;
#
#$gfx->textstart();
#$gfx->font($font, $star_list_size);
#$gfx->fillcolor(@{$colors{star_list}});
#
#foreach (sort constsort keys %stars) {
#	my $xstr = sprintf("%.1f :",$stars{$_}{'x'}/10);
#	my $ystr = sprintf("%.1f",$stars{$_}{'y'}/10);
#	$gfx->translate($x+9,$y);
#	$gfx->text_right($xstr);
#	$gfx->translate($x+17,$y);
#	$gfx->text_right($ystr);
#
#	my $name = $_;
#	my $indent = 0;
#	if ($name =~ / /) {
#		$name =~ s/^(.*) (.*)/$2, $1/;
#		if(1) { # new style.
#			unless($name =~ /, Alpha$/) {
#				$name =~ s/.*, //;
#				$indent = 3;
#			}
#		}
#	}
#	$gfx->translate($x+19+$indent,$y);
#	$gfx->text($name);
#	$y -= $star_list_step;
#	if ($y < ($liststarty+3)) {
#		$colnum++;
#		$x += ($listwidth/$star_list_cols);
#		$y = $yreset;
#		if($colnum == 2) { $y -= $star_list_step*2 }
#	}
#}
#$gfx->textend();
#
# Credits
#{
#	my $total_steps = int(($yreset - $liststarty) / $star_list_step);
#	my $y = $yreset - ($total_steps - @credits) * $star_list_step;
#	for(my $i = 0; $i < @credits; $i++) {
#		my $f = $font;
#		if($credits[$i][1]) { $f = $fontbold; }
#		$gfx->textlabel($x, $y, $f, $star_list_size, $credits[$i][0], -color=>$colors{star_list});
#		$y -= $star_list_step;
#	}
#}

#progress("Drawing legend...\n");
#my $legstartx = $mapstartx + $mapsize + $pagemargin;
#my $legstarty = 22;
#my $legwidth = $w - $liststartx - $pagemargin;
#my $legheight = $liststarty-$pagemargin/2-$legstarty;
#draw_border($gfx, $legstartx-1,$legstarty-1, $legwidth+2,$legheight+2);
#
#$gfx->textlabel( $legstartx + 2, $legstarty+$legheight-$h2size, $fontbold,$h2size, "Legend", -color=>$colors{legend_title});
#
#
#
# Draw example stars
#{
#	my $y = $legstarty+$legheight-$h2size-10;
#	foreach my $size (sort keys %size_map) {
#		my $x = $legstartx+32;
#		foreach my $color (@color_order) {
#			for(my $i = 0; $i < $glow_steps; $i++) {
#				draw_star_glow($gfx, $x, $y, $size, $color, $i);
#			}
#			drawstar($gfx, $x, $y, $size, $color, 0, 0);
#			$x += 15;
#		}
#		$y -= 7;
#	}
#}
#
## Label legend stars sizes
#{
#	my $y = $legstarty+$legheight-$h2size-10 - 5/2 + 1;
#	$gfx->textstart();
#	$gfx->font($font, 4);
#	$gfx->fillcolor(@{$colors{legend_text}});
#	foreach my $size (sort keys %size_map) {
#		$gfx->translate($legstartx+2,$y);
#		$gfx->text($size_name{$size});
#		$y -= 7;
#	}
#	$gfx->textend();
#}
#
## Label legend stars colors
#{
#	my $y = $legstarty+$legheight-$h2size-6;
#	my $x = $legstartx+32;
#	$gfx->textstart();
#	$gfx->font($font, 4);
#	$gfx->fillcolor(@{$colors{legend_text}});
#	foreach my $color (@color_order) {
#		$gfx->translate($x,$y);
#		$gfx->text_center($color_name_map{$color});
#		$x += 15;
#	}
#	$gfx->textend();
#}
#
#if($spoil_stars) {
#	# Point of interest legend star
#	$gfx->fillcolor(@{$colors{legend_text}});
#	drawstar($gfx, $legstartx+5, $legstarty + 8, 'GIANT_STAR', 'EXAMPLE', 1, 0);
#	$gfx->textlabel($legstartx+11, $legstarty+8-5/2, $font, 5, "Point of Interest");
#
#	# Rainbow legend star
#	drawstar($gfx, $legstartx+74, $legstarty + 8, 'GIANT_STAR', 'EXAMPLE', 1, 1);
#	$gfx->textlabel($legstartx+78, $legstarty+8-5/2, $font, 5, "Rainbow Planet");
#}
#
# Greek letters in legend
#my $legx = $legstartx + 124;
#my $legystart = $legstarty + $legheight - 8;
#my $legy = $legystart;
#my $i = 0;
#$gfx->textstart();
#$gfx->font($font, 5);
#$gfx->fillcolor(@{$colors{legend_text}});
#foreach (@starnums) {
#	$gfx->translate($legx,$legy);
#	$gfx->text_center($symbols[$i++]);
#	$gfx->translate($legx+8,$legy);
#	$gfx->text($_);
#	$legy -= 5.5;
#	if ($legy < $legstarty+8) {
#		$legy = $legystart;
#		$legx += 40;
#	}
#}
#$gfx->textend();

#progress("Drawing constellations...\n");
#draw_constellations($gfx);
### Validate that all replacements and additions were used.
#foreach my $c (keys %replace_links) { if(not exists $used_links{$c}) { die "Replace link $c never used\n"; } }
#foreach my $c (keys %additional_links) { if(not exists $used_links{$c}) { die "Additional link $c never used\n"; } }

#progress("Drawing glows...\n");
#for(my $layer = 0; $layer < $glow_steps; $layer++) {
#	foreach (keys %stars) {
#		my %star = %{$stars{$_}};
#
#		my ($x, $y) = unitomap($star{'x'}, $star{'y'});
#		my $sizes = $star{'size'};
#		my $col = $star{'color'};
#
#		draw_star_glow($gfx, $x, $y, $sizes, $col, $layer);
#	}
#}
#
progress("Drawing stars...\n");
foreach (keys %stars) {
	my %star = %{$stars{$_}};

	my ($x, $y) = unitomap($star{'x'}, $star{'y'});
	my $sizes = $star{'size'};
	my $col = $star{'color'};

	my $interest = $star{'interest'};
	my $interesting = 0;
	my $rainbow = 0;
	if ($interest ne '0' && !($interest =~ /MELNORME._DEFINED/)) {
		$interesting = 1;
		$rainbow = $interest eq 'RAINBOW_DEFINED';
	}
	drawstar($gfx, $x, $y, $sizes, $col, $interesting, $rainbow);

	if ($star{'pre'}) {
		my $size = size_string_to_size($sizes);
		$gfx->textlabel($x+($size/3), $y+.25, $font, 3, $symbols[$star{'pre'}-1], -color=> $colors{greek_label});
	}
}

#
#progress("Labelling constellations and repelling labels...\n");
#my $constellation_font_size = 4;
#$gfx->textstart();
#$gfx->font($fontbold, $constellation_font_size);
#$gfx->fillcolor(@{$colors{constellation_name}});
#foreach (keys %constellations) {
#	my $name = $starnames[$_];
#	my @coords = @{$constellations{$_}};
#	my $amt=0;
#	my $avgx=0;
#	my $avgy=0;
#	foreach (@coords) {
#		my ($x, $y) = @{$_};
#		$avgx += $x;
#		$avgy += $y;
#		$amt++;
#	}
#	$avgx/=$amt;
#	$avgy/=$amt;
#
#	($avgx, $avgy) = unitomap($avgx,$avgy);
#
#	# This division is almost certainly wrong, but it matches
#	# the old implementation and happens to look right.
#	my $strw = $gfx->advancewidth($name)/$constellation_font_size;
#	my $x = $avgx;
#	my $y = $avgy+4;
#
#	my $valid = 0; # repel labels off of stars until they do not intersect.
#	my $moveleft = 200; # Infinite loop prevention
#	while (!$valid && $moveleft) {
#		$moveleft--;
#		if ($x - $strw < $mapstartx + 10 ) {
#			$x = $mapstartx + 10 + $strw;
#		}
#		if ($x + $strw > $mapstartx + $mapsize - 10 ) {
#			$x = $mapstartx + $mapsize - $strw - 10;
#		}
#
#		if ($y + 2 > $mapstarty + $mapsize - 5) {
#			$y = $mapstarty + $mapsize - 5;
#		}
#
#		my @col;
#		foreach (keys %stars) {
#			my %star = %{$stars{$_}};
#			my ($sx, $sy) = unitomap($star{'x'}, $star{'y'});
#			if (($sx > $x - $strw-4) &&
#				($sx < $x + $strw+4) &&
#				($sy > $y - 6) &&
#				($sy < $y + 6)) {
#				push @col, \%star;
#			}
#		}
#		if (@col == 0) {
#			$valid = 1;
#		} else {
#			# Special cases for some labels the repel doesn't work on
#			if(exists $constellation_shift{$name}) {
#				$x += $constellation_shift{$name}[0];
#				$y += $constellation_shift{$name}[1];
#			} else {
#				my $avgx;
#				my $avgy;
#				foreach (@col) {
#				my ($sx, $sy) = unitomap(${$_}{'x'}, ${$_}{'y'});
#					my $dx += $x - $sx;
#					my $dy += $y - $sy;
#					my $d = sqrt(($dx*$dx)+($dy*$dy));
#					$dx /= $d;
#					$dy /= $d;
#					$avgx += $dx;
#					$avgy += $dy;
#				}
#				$avgx /= ($#col+1);
#				$avgy /= ($#col+1);
#				my $d = sqrt(($avgx*$avgx)+($avgy*$avgy));
#				$x += 2*$avgx/$d;
#				$y += 2*$avgy/$d;
#			}
#		}
#	}
#
#	$gfx->translate($x,$y);
#	$gfx->text_center($name);
#}
$gfx->textend();

progress("Done!\n");

$pdf->save();
exit(0);

sub toname {
	my ($pre, $post) = @_;
	if ($pre == 0) {
		return $starnames[$post];
	} else {
		return $starnums[$pre - 1] . " " . $starnames[$post];
	}
}

sub unitomap {
	my ($x, $y) = @_;
	return ($x*$mapsize/9999 + $mapstartx,
			$y*$mapsize/9999 + $mapstarty)
}

sub gametomap_linear {
	my ($x) = @_;
	return $x*$mapsize/1000;
}

sub gametomap_xy {
	my ($x, $y) = @_;
	return (gametomap_linear($x) + $mapstartx,
			gametomap_linear($y) + $mapstarty)
}

sub size_string_to_size {
	my($sizestr) = @_;
	if(exists $size_map{$sizestr}) { return $size_map{$sizestr}; }
	die "Unknown star size $sizestr";
}

sub star_color_string_to_color {
	my($col) = @_;
	if(exists $color_map{$col}) { return @{$color_map{$col}}; }
	die "Unknown star color $col";
}

sub draw_star_glow {
	my($gfx, $x, $y, $sizes, $col, $step) = @_;
	if(not $glow_stars) { return; }

	my $size = size_string_to_size($sizes);

	my ($r,$g,$b) = star_color_string_to_color($col);
	my ($rb,$gb,$bb) = @{$colors{background}};

	my $glow_size = 3;
	my $glow_step = $glow_size/$glow_steps;
	my $glow_jump = .6; # 1=smooth transition to star, .5=sharp
	$size += $glow_size - $step*$glow_step;

	my $fg = $glow_jump*$step/($glow_steps);
	my $bg = 1-$fg;
	my $rr = $fg*$r+$bg*$rb;
	my $gr = $fg*$g+$bg*$gb;
	my $br = $fg*$b+$bg*$bb;
	drawcircle($gfx, $x, $y, $size/2, $rr, $gr, $br, $size/5, $fill_stars);
}

sub drawstar {
	my($gfx, $x, $y, $sizes, $col, $interest, $rainbow) = @_;

	my $size = size_string_to_size($sizes);

	my ($r,$g,$b) = star_color_string_to_color($col);

	if($interest) { draw_sparkle($x, $y, $size, $rainbow); }

	drawcircle($gfx, $x, $y, $size/2, $r, $g, $b, $size/5, $fill_stars);
	#print "$_ at ".int($x).", ".int($y)."... ";
}


sub drawcircle {
	my ($gfx, $x, $y, $rad, $r, $g, $b, $width, $fill) = @_;
	$gfx->strokecolor($r,$g,$b);
	if($fill) { $gfx->fillcolor($r,$g,$b); }
	$gfx->linewidth($width);
	$gfx->circle($x, $y, $rad);
	if($fill) { $gfx->fill(); }
	$gfx->stroke();
	return;
}


sub constsort {
	my $apost = $a;
	$apost =~ s/^.* //;
	my $bpost = $b;
	$bpost =~ s/^.* //;
	if (($apost cmp $bpost) != 0) {
		return $apost cmp $bpost;
	}

	return $stars{$a}{'pre'} <=> $stars{$b}{'pre'};
}

sub draw_sparkle {
	if(not $spoil_stars) { return; }
	my ($x, $y, $size, $rainbow) = @_;
	if($rainbow) {
		$gfx->linewidth($size/3);
	} else {
		$gfx->strokecolor(@{$colors{feature_sparkle}});
		$gfx->linewidth($size/10);
	}
	for (0 .. 7) {
		if ($rainbow) {
			my ($r,$g,$b) = @{$rainbow[$_]};
			$gfx->strokecolor($r,$g,$b);
		}
		my $r = $_*$PI*2/8;
		my $xd = sin($r);
		my $yd = cos($r);
		$gfx->move( $x+($xd*$size*.55),$y+($yd*$size*.55) );
		$gfx->line( $x+($xd*$size*1.5),$y+($yd*$size*1.5) );
		$gfx->stroke();
	}	
}

sub usage_and_exit {
	my($error) = @_;
	if(defined $error) { print STDERR "$error\n"; }
	my $colorsets = join(", ", sort keys %colors_preset);
	# TODO: List specific colors from hash.
	print STDERR <<END;
$0 <options>
  -o|--outfile=<filename>
    File to write map to. Defaults to starmap.pdf.
  -p|--printer-friendly
    White background version. Identical to --colorset=white
  -c|--colorset=<color set name>
    Specify the color set. Defaults to $default_colorset. Valid options:
      $colorsets
  --spoilers
    Show modern spheres of influence and mark notable stars.
	Equivalent to --mark-notable-stars --spheres=modern.
  --no-fill-stars
    Don't fill the stars in
  --no-glow-stars
    Don't give the stars a glow. Results in a smaller file size.
  --spheres=(modern|historic|none)
    Show modern, historic, or no spheres of influence. Default $spheres. 
	modern spheres of influence are spoilers.
  --mark-notable-stars
    Mark notable stars on the map (spoilers)
  --quiet
    Suppress normal status output
END
	if(defined $error) { exit(1); }
	exit(0);
}

sub parse_color {
	local $_ = $_[0];
	if(/([\.\d]+),([\.\d]+),([\.\d]+)/) {
		my($r,$g,$b) = ($1,$2,$3);
		if($r > 1 || $r < 0) { die "Unable to parse color $_ (red is out of range 0-1).\n"; }
		if($g > 1 || $g < 0) { die "Unable to parse color $_ (green is out of range 0-1).\n"; }
		if($b > 1 || $b < 0) { die "Unable to parse color $_ (blue is out of range 0-1).\n"; }
		return($r,$g,$b);
	}
	die "Unable to parse color argument $_.\n";
}


sub set_color {
	my($option, $value) = @_;
	my $key = $option;
	$key =~ s/^color-//;
	$key =~ s/-/_/g;
	if(not defined $colors_preset{$default_colorset}{$key}) {
		die "Internal error: set_color($option, $value)";
	}
	$colors{$key} = [parse_color($value)];
}

sub draw_border {
	my($gfx, $x1, $y1, $x2, $y2) = @_;
	$gfx->linewidth(2);
	$gfx->strokecolor(@{$colors{borders}});
	$gfx->rect($x1,$y1,$x2,$y2);
	$gfx->stroke();
}

sub draw_rect {
    my($gfx, $x, $y) = @_;

    $gfx->linewidth(0.9);
	$gfx->strokecolor(@{$colors{route}});

    my ($dx,$dy) = unitomap($x, $y);

    $gfx->move($dx,$dy);
    ($dx,$dy) = unitomap($x + 1500, $y);
    $gfx->line($dx,$dy);

    $gfx->move($dx,$dy);
    ($dx,$dy) = unitomap($x + 1500, $y - 1500);
    $gfx->line($dx,$dy);

    $gfx->move($dx,$dy);
    ($dx,$dy) = unitomap($x, $y - 1500);
    $gfx->line($dx,$dy);

    $gfx->move($dx,$dy);
    ($dx,$dy) = unitomap($x, $y);
    $gfx->line($dx,$dy);

	$gfx->stroke();
	$gfx->endpath();
}

sub validate_replace_links {
	my(%replace_links) = @_;
	my %symbols = map { $_ => 1 } @symbols;
	my $num_systems = 0;
	my $num_links = 0;
	foreach my $system (sort keys %replace_links) {
		$num_systems++;
		if(not defined $replace_links{$system}) {
			die "$system has undefined value\n";
		}
		my(@sets) = @{$replace_links{$system}};
		if(@sets < 1) { die "$system lacks at least 1 link chain\n"; }
		foreach my $s (@sets) {
			my(@links) = @{$s};
			if(@links < 2) { die "$system has short link chain\n"; }
			foreach my $l (@links) {
				$num_links++;
				if(not exists $symbols{$l}) {
					die "$system has unknown symbol $l\n";
				}
			}
		}
	}
	#print "$num_systems $num_links\n";
}

sub sort_constellation {
	my($constellation) = @_;
	if(exists $replace_links{$constellation}) {
		$used_links{$constellation} = 'replaced';
		return @{$replace_links{$constellation}};
	}
	my @first_set;
	for(my $i = 0; $i < @symbols; $i++) {
		if(exists $stars{"$starnums[$i] $constellation"}) {
			push @first_set, $symbols[$i];
		}
	}
	my(@results) = (\@first_set);
	if(exists $additional_links{$constellation}) {
		$used_links{$constellation} = 'added';
		push @results, $additional_links{$constellation};
	}
	return @results;
}

sub draw_constellations {
	my($gfx) = @_;
	foreach my $constellation_num (keys %constellations) {
		my $constellation_name = $starnames[$constellation_num];
		if(exists $stars{$constellation_name}) { next; } # Single star.
		draw_constellation($gfx, $constellation_name);
	}
}

sub draw_constellation {
	my($gfx, $constellation) = @_;

	my %symbols;
	for(my $i = 0; $i < @symbols; $i++) {
		my $short = $symbols[$i];
		my $long = $starnums[$i];
		$symbols{$short} = $long;
	}

	$gfx->linewidth(.25);
	$gfx->strokecolor(@{$colors{constellation_line}});

	my(@sets) = sort_constellation($constellation);
	foreach my $set (@sets) {
		my @links = @{$set};
		# TODO: This can be refactored to eliminate the if in the middle of the loop.
		for(my $i = 1; $i < @links; $i++) {
			my $parentname = "$symbols{$links[$i-1]} $constellation";
			my %parent = %{$stars{$parentname}};
			my ($x1, $y1) = unitomap($parent{'x'}, $parent{'y'});

			my $starname = "$symbols{$links[$i]} $constellation";
			my %star = %{$stars{$starname}};
			my ($x2, $y2) = unitomap($star{'x'}, $star{'y'});

			if($i == 1) {$gfx->move($x1,$y1);}
			$gfx->line($x2,$y2);
		}
	}
	$gfx->stroke();
}

sub progress {
	if($quiet) { return; }
	print @_;
}


sub circle_text {
	my($gfx, $x, $y, $r, $draw_angle, $fontsize, $text) = @_;

	my $text_angle = $draw_angle-90;
	if($text_angle < 0) { $text_angle += 360; }

	my(@letters) = split(//, $text);

	my $prev_width = 0;
	foreach my $letter (@letters) {
		my $width = $gfx->advancewidth($letter);
		my $shift = ($width+$prev_width)/2;
		my $adjust_angle = ($shift*360)/(2*$PI*($r+$fontsize/2));
		$draw_angle -= $adjust_angle;
		while($draw_angle < 0) { $draw_angle += 360; }
		$text_angle -= $adjust_angle;
		while($text_angle < 0) { $text_angle += 360; }
		$prev_width = $width;

		my $dx = $r * cos(2*$PI*$draw_angle/360);
		my $dy = $r * sin(2*$PI*$draw_angle/360);
		$gfx->transform(-translate => [$x+$dx,$y+$dy], -rotate => $text_angle);
		$gfx->text_center($letter);
	}
	
	my $shift = $prev_width/2;
	my $adjust_angle = ($shift*360)/(2*$PI*($r+$fontsize/2));
	$draw_angle -= $adjust_angle;

	return $draw_angle;
}
