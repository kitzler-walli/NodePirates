using System;
using System.Collections.Generic;
using Nancy;
using Nancy.IO;
using Nancy.ModelBinding;
namespace player_simple_core
{
	public class Player
	{
		private static Player _instance;

		public static Player Instance {
			get {
				if(_instance == null){
					_instance = new Player();
				}
				return _instance;
			}
		}

		public static void Reset(){
			_instance = null;
		}

		public Player()
		{
			
		}

		// Coordinates of the next shot
		//private const int size = 10;
		private float max_prob, prob;
        private int[] x = new int[5], y = new int[5];
        private string st_ship_2, st_ship_3_1, st_ship_3_2, st_ship_4, st_ship_5;
        private float ship_2, ship_3_1, ship_3_2, ship_4, ship_5; // counts possible positions of named ship
        private float xy_ship_2, xy_ship_3_1, xy_ship_3_2, xy_ship_4, xy_ship_5; // counts possible positions of named ship to a specific field xy
        private int x_min; // x Coordinate with minimum possible shipart placed referred to x
        private int x_max; // x Coordinate with maximum possible shipart placed referred to x
        private int y_min; // y Coordinate with minimum possible shipart placed referred to y
        private int y_max; // y Coordinate with maximum possible shipart placed referred to y
        private string[,] MyField = new string[12,12];
        private bool first_start = true;
		private Coordinates lastShot = null;

		/// <summary>
		/// Move method contains the code that fires.
		/// </summary>
		/// <param name="playingField">Opponent's playing field</param>
		public Coordinates Move(PlayingField playingField)
		{
			if(lastShot != null){
				updateMyField(MyField, playingField, lastShot.X+1, lastShot.Y+1);
			}
			

			// Initialize some relevant 
            if (first_start)
            {
                first_start = false;
                initMyField(MyField);
            }
            
            prob = 0;
            max_prob = 0;
            ship_2 = 0;
            ship_3_1 = 0;
            ship_3_2 = 0;
            ship_4 = 0;
            ship_5 = 0;

            //count Possible Ship Positions over all Battlefield
            for (int j = 10; j >= 1; j--)
            {
                 for (int i = 10; i >= 1; i--)
                {
                    x_min = xmin(i, j, MyField);
                    if (i - x_min > 0) { ship_2 = ship_2 + i - x_min; }
                    if (i - x_min > 1) { ship_3_1 = ship_3_1 + i - x_min - 1; }
                    if (i - x_min > 1) { ship_3_2 = ship_3_2 + i - x_min - 1; }
                    if (i - x_min > 2) { ship_4  = ship_4 + i - x_min - 2;}
                    if (i - x_min > 3) { ship_5  = ship_5 + i - x_min - 3;}
                    i = x_min;
                }
            }
            for (int i = 10; i >= 1; i--)
            {
                for (int j = 10; j >= 1; j--)
                {
                    y_min = ymin(i, j, MyField);
                    if (j - y_min > 0) { ship_2 = ship_2 + j - y_min; }
                    if (j - y_min > 1) { ship_3_1 = ship_3_1 + j - y_min - 1; }
                    if (j - y_min > 1) { ship_3_2 = ship_3_2 + j - y_min - 1; }
                    if (j - y_min > 2) { ship_4 = ship_4 + j - y_min - 2; }
                    if (j - y_min > 3) { ship_5 = ship_5 + j - y_min - 3; }
                    j = y_min;
                }
            }
            if (st_ship_2 == "S") { ship_2 = 1; }
            if (st_ship_3_1 == "S") { ship_3_1 = 1; }
            if (st_ship_3_2 == "S") { ship_3_2 = 1; }
            if (st_ship_4 == "S") { ship_4 = 1; }
            if (st_ship_5 == "S") { ship_5 = 1; }


            // get Maximum Probability
            for (int i = 10; i >= 1; i--)
            {
                for (int j = 10; j >= 1; j--)
                {
                    if (MyField[i,j] == "U")
                    {
                        prob = RelevantHit(i, j, MyField);                        
                        //if (prob >= max_prob)
                        //{
                        //    max_prob = prob;
                        //    x = i;            //int(x_max - x_min);
                        //    y = j;            //int(y_max - y_min);
                        //}

                        xy_ship_2 = 0;
                        xy_ship_3_1 = 0;
                        xy_ship_3_2 = 0;
                        xy_ship_4 = 0;
                        xy_ship_5 = 0;

                        x_min = xmin(i, j, MyField);
                        x_max = xmax(i, j, MyField);
                        y_min = ymin(i, j, MyField);
                        y_max = ymax(i, j, MyField);

                        //if ((x_max - x_min > 0) & (st_ship_2 == "H"))   { xy_ship_2   = xy_ship_2   + Math.Min(Math.Min(i - x_min, x_max - i), 1) + 1; }
                        //if ((y_max - y_min > 0) & (st_ship_2 == "H"))   { xy_ship_2   = xy_ship_2   + Math.Min(Math.Min(j - y_min, y_max - j), 1) + 1; }
                        //if ((x_max - x_min > 1) & (st_ship_3_1 == "H")) { xy_ship_3_1 = xy_ship_3_1 + Math.Min(Math.Min(i - x_min, x_max - i), 2) + 1; }
                        //if ((y_max - y_min > 1) & (st_ship_3_1 == "H")) { xy_ship_3_1 = xy_ship_3_1 + Math.Min(Math.Min(j - y_min, y_max - j), 2) + 1; }
                        //if ((x_max - x_min > 1) & (st_ship_3_2 == "H")) { xy_ship_3_2 = xy_ship_3_2 + Math.Min(Math.Min(i - x_min, x_max - i), 2) + 1; }
                        //if ((y_max - y_min > 1) & (st_ship_3_2 == "H")) { xy_ship_3_2 = xy_ship_3_2 + Math.Min(Math.Min(j - y_min, y_max - j), 2) + 1; }
                        //if ((x_max - x_min > 2) & (st_ship_4 == "H"))   { xy_ship_4   = xy_ship_4   + Math.Min(Math.Min(i - x_min, x_max - i), 3) + 1; }
                        //if ((y_max - y_min > 2) & (st_ship_4 == "H"))   { xy_ship_4   = xy_ship_4   + Math.Min(Math.Min(j - y_min, y_max - j), 3) + 1; }
                        //if ((x_max - x_min > 3) & (st_ship_5 == "H"))   { xy_ship_5   = xy_ship_5   + Math.Min(Math.Min(i - x_min, x_max - i), 4) + 1; }
                        //if ((y_max - y_min > 3) & (st_ship_5 == "H"))   { xy_ship_5   = xy_ship_5   + Math.Min(Math.Min(j - y_min, y_max - j), 4) + 1; }


                        if ((x_max - x_min > 0) & (st_ship_2 == "P")) { xy_ship_2 = xy_ship_2 + Math.Min(Math.Min(i - x_min, x_max - i), Math.Min(x_max - x_min - 1, 1)) + 1; }
                        if ((y_max - y_min > 0) & (st_ship_2 == "P")) { xy_ship_2 = xy_ship_2 + Math.Min(Math.Min(j - y_min, y_max - j), Math.Min(y_max - y_min - 1, 1)) + 1; }
                        if ((x_max - x_min > 1) & (st_ship_3_1 == "P")) { xy_ship_3_1 = xy_ship_3_1 + Math.Min(Math.Min(i - x_min, x_max - i), Math.Min(x_max - x_min - 2, 2)) + 1; }
                        if ((y_max - y_min > 1) & (st_ship_3_1 == "P")) { xy_ship_3_1 = xy_ship_3_1 + Math.Min(Math.Min(j - y_min, y_max - j), Math.Min(y_max - y_min - 2, 2)) + 1; }
                        if ((x_max - x_min > 1) & (st_ship_3_2 == "P")) { xy_ship_3_2 = xy_ship_3_2 + Math.Min(Math.Min(i - x_min, x_max - i), Math.Min(x_max - x_min - 2, 2)) + 1; }
                        if ((y_max - y_min > 1) & (st_ship_3_2 == "P")) { xy_ship_3_2 = xy_ship_3_2 + Math.Min(Math.Min(j - y_min, y_max - j), Math.Min(y_max - y_min - 2, 2)) + 1; }
                        if ((x_max - x_min > 2) & (st_ship_4 == "P")) { xy_ship_4 = xy_ship_4 + Math.Min(Math.Min(i - x_min, x_max - i), Math.Min(x_max - x_min - 3, 3)) + 1; }
                        if ((y_max - y_min > 2) & (st_ship_4 == "P")) { xy_ship_4 = xy_ship_4 + Math.Min(Math.Min(j - y_min, y_max - j), Math.Min(y_max - y_min - 3, 3)) + 1; }
                        if ((x_max - x_min > 3) & (st_ship_5 == "P")) { xy_ship_5 = xy_ship_5 + Math.Min(Math.Min(i - x_min, x_max - i), Math.Min(x_max - x_min - 4, 4)) + 1; }
                        if ((y_max - y_min > 3) & (st_ship_5 == "P")) { xy_ship_5 = xy_ship_5 + Math.Min(Math.Min(j - y_min, y_max - j), Math.Min(y_max - y_min - 4, 4)) + 1; }


                        //if ((x_max - x_min > 0) & (st_ship_2 == "H")) { xy_ship_2 = xy_ship_2 + Math.Min(i - x_min, x_max - i) + 1; }
                        //if ((y_max - y_min > 0) & (st_ship_2 == "H")) { xy_ship_2 = xy_ship_2 + Math.Min(j - y_min, y_max - j) + 1; }
                        //if ((x_max - x_min > 1) & (st_ship_3_1 == "H")) { xy_ship_3_1 = xy_ship_3_1 + Math.Min(i - x_min, x_max - i) + 1; }
                        //if ((y_max - y_min > 1) & (st_ship_3_1 == "H")) { xy_ship_3_1 = xy_ship_3_1 + Math.Min(j - y_min, y_max - j) + 1; }
                        //if ((x_max - x_min > 1) & (st_ship_3_2 == "H")) { xy_ship_3_2 = xy_ship_3_2 + Math.Min(i - x_min, x_max - i) + 1; }
                        //if ((y_max - y_min > 1) & (st_ship_3_2 == "H")) { xy_ship_3_2 = xy_ship_3_2 + Math.Min(j - y_min, y_max - j) + 1; }
                        //if ((x_max - x_min > 2) & (st_ship_4 == "H")) { xy_ship_4 = xy_ship_4 + Math.Min(i - x_min, x_max - i) + 1; }
                        //if ((y_max - y_min > 2) & (st_ship_4 == "H")) { xy_ship_4 = xy_ship_4 + Math.Min(j - y_min, y_max - j) + 1; }
                        //if ((x_max - x_min > 3) & (st_ship_5 == "H")) { xy_ship_5 = xy_ship_5 + Math.Min(i - x_min, x_max - i) + 1; }
                        //if ((y_max - y_min > 3) & (st_ship_5 == "H")) { xy_ship_5 = xy_ship_5 + Math.Min(j - y_min, y_max - j) + 1; }

                        prob = prob + Math.Max(Math.Max(Math.Max(Math.Max(xy_ship_2 / ship_2, xy_ship_3_1 / ship_3_1), xy_ship_3_2 / ship_3_2), xy_ship_4 / ship_4), xy_ship_5 / ship_5);
                        
                        // define new Maximum Probability for x and Y
                        if (prob >= max_prob)
                        {
                            max_prob = prob;
                            for (int f = 1; f <= 4; f++)
                            {
                                x[f] = x[f - 1];
                                y[f] = x[f - 1];
                            }
                            x[0] = i;
                            y[0] = j;
                        }
                    }
                }
            }

            lastShot  = new Coordinates(x[0] - 1, y[0] - 1);
			return lastShot;
		}

        //initializes the Battlefield for the sake of easy programming a additional boareder is added
        private void initMyField (string[,] initField)
        {
            for (int k = 0; k < 12; k++)
            {
                initField[0, k] = "W";
                initField[k, 0] = "W";
                initField[11, k] = "W";
                initField[k, 11] = "W";
            }
            for (int kx = 1; kx < 11; kx++)
            {
                for (int ky = 1; ky  < 11; ky++)
                {
                    initField[kx, ky] = "U";
                }
            }
            st_ship_2 = "P"; 
            st_ship_3_1 = "P"; 
            st_ship_3_2 = "P"; 
            st_ship_4 = "P"; 
            st_ship_5 = "P";
        }

        //update the Battlefield with respect to the information the last shot gives
        private void updateMyField(string[,] updateField, PlayingField pf, int up_x, int up_y)
        {
            string act_field = pf.GetState(up_x - 1, up_y - 1);
            //updateField[up_x, up_y] = act_field;


            if (act_field == "H")
            { 
                updateField[up_x - 1, up_y - 1] = "W";
                updateField[up_x + 1, up_y - 1] = "W";
                updateField[up_x - 1, up_y + 1] = "W";
                updateField[up_x + 1, up_y + 1] = "W";
            }

            // clean up total battlefield 
            for (int kx = 1; kx < 11; kx++)
            {
                for (int ky = 1; ky  < 11; ky++)
                {
                    // update everything from the actual Battlefield
                    if (pf.GetState(kx - 1, ky - 1) != "U") { updateField[kx, ky] = pf.GetState(kx - 1, ky - 1); } 
                    // sunken ships gives the knowledge that arround can not be anything else than water if this flied is unknown
                    if (updateField[kx, ky] == "U" & 
                        (updateField[kx - 1, ky] == "S" | updateField[kx + 1, ky] == "S" | 
                        updateField[kx, ky - 1] == "S" | updateField[kx, ky + 1] == "S" | 
                        updateField[kx - 1, ky - 1] == "S" | updateField[kx + 1, ky - 1] == "S" | 
                        updateField[kx - 1, ky + 1] == "S" | updateField[kx + 1, ky + 1] == "S"))
                    {
                        updateField[kx, ky] = "W";
                    }
                    // if up, down, left, or rigth is anything else then water or sunken ships there can not be anything else than water if this flied is unknown
                    if (updateField[kx, ky] == "U" &
                        (updateField[kx - 1, ky] == "W" | updateField[kx - 1, ky] == "S") & 
                        (updateField[kx + 1, ky] == "W" | updateField[kx + 1, ky] == "S") &
                        (updateField[kx, ky - 1] == "W" | updateField[kx, ky - 1] == "S") & 
                        (updateField[kx, ky + 1] == "W" | updateField[kx, ky + 1] == "S") 
                       )
                    {
                        updateField[kx, ky] = "W";
                    }
                }
            }
            // evaluate which ship has been destroyed 
            if (act_field == "S")
            {
                int ship = whichShipSunk(up_x, up_y, updateField);
                if (ship == 2) { st_ship_2 = "S"; }
                if ((ship == 3) & st_ship_3_1 == "S") { st_ship_3_2 = "S"; }
                if (ship == 3) { st_ship_3_1 = "S"; }
                if (ship == 4) { st_ship_4 = "S"; }
                if (ship == 5) { st_ship_5 = "S"; }             
            }
        }

        private int xmin(int xm, int ym, string[,] pf)
        {
            do { xm--; }
            while (pf[xm, ym] == "U" | pf[xm, ym] == "H"); // several additional option must be added
            return xm + 1;
        }


        private int xmax(int xm, int ym, string[,] pf)
        {
            do{ xm++; }
            while (pf[xm, ym] == "U" | pf[xm, ym] == "H"); // several additional option must be added
            return xm - 1;
        }

        private int ymin(int xm, int ym, string[,] pf)
        {
            do { ym--; }
            while (pf[xm, ym] == "U" | pf[xm, ym] == "H"); // several additional option must be added
            return ym + 1;
        }

        private int ymax(int xm, int ym, string[,] pf)
        {
            do { ym++; }
            while (pf[xm, ym] == "U" | pf[xm, ym] == "H");  // several additional option must be added
            return ym - 1;
        }



        private float RelevantHit(int xm, int ym, string[,] pf) //Richtungsuche mitgeben
        {
            float counter = 1;
            
            //Look to the left if there is any hitten Ship
            if (pf[xm - 1, ym] == "H")
            {                
                if (pf[xm - 1, ym - 1] == "U") { counter++; }
                if (pf[xm - 1, ym + 1] == "U") { counter++; }
            
                for (int k = 2; k <= xm; k++)
                {
                    if (pf[xm - k, ym] == "H") {}
                    else 
                    {
                        if (pf[xm - k, ym] == "U") { counter++; break; }
                        else { break; }
                    }
                }
                return 1 / counter;
            }

            //Look to the right if there is any hitten Ship
            if (pf[xm + 1, ym] == "H")
            {
                if (pf[xm + 1, ym - 1] == "U") { counter++; }
                if (pf[xm + 1, ym + 1] == "U") { counter++; }
            
                for (int k = 2; k <= 11 - xm; k++)
                {
                    if (pf[xm + k, ym] == "H") {}
                    else 
                    {
                        if (pf[xm + k, ym] == "U") { counter++; break; }
                        else { break; }
                    }
                }
                return 1 / counter;
            }

            //Look to the top if there is any hitten Ship
            if (pf[xm, ym - 1] == "H")
            {
                if (pf[xm - 1, ym - 1] == "U") { counter++; }
                if (pf[xm + 1, ym - 1] == "U") { counter++; }
            
                for (int k = 2; k <= ym; k++)
                {
                    if (pf[xm, ym - k] == "H") {}
                    else 
                    {
                        if (pf[xm, ym - k] == "U") { counter++; break; }
                        else { break; }
                    }
                }
                return 1 / counter;
            }

            //Look to the bottom if there is any hitten Ship
            if (pf[xm, ym + 1] == "H")
            {
                if (pf[xm - 1, ym + 1] == "U") { counter++; }
                if (pf[xm + 1, ym + 1] == "U") { counter++; }                
            
                for (int k = 2; k <= 11 - ym; k++)
                {
                    if (pf[xm, ym + k] == "H") {}
                    else 
                    {
                        if (pf[xm, ym + k] == "U") { counter++; break; }
                        else { break; }
                    }
                }
                return 1 / counter;
            }
            return 0 / counter;
        }
        
        
        private int whichShipSunk(int xm, int ym, string[,] pf) //Richtungsuche mitgeben
        {
            int counter = 1;
            //Look to the left if there is any hitten Ship
            if (pf[xm - 1, ym] == "S")
            {
                for (int k = 1; k <= xm; k++)
                {
                    if (pf[xm - k, ym] == "S") { counter++; }
                    else { break; }                    
                }
            }
            //Look to the right if there is any hitten Ship
            if (pf[xm + 1, ym] == "S")
            {
                for (int k = 1; k <= 11 - xm; k++)
                {
                    if (pf[xm + k, ym] == "S") { counter++; }
                    else { break; }
                }
            }
            //Look to the top if there is any hitten Ship
            if (pf[xm, ym - 1] == "S")
            {
                for (int k = 1; k <= ym; k++)
                {
                    if (pf[xm, ym - k] == "S") { counter++; }
                    else { break; }
                }
            }
            //Look to the bottom if there is any hitten Ship
            if (pf[xm, ym + 1] == "S")
            {
                for (int k = 1; k <= 11 - ym; k++)
                {
                    if (pf[xm, ym + k] == "S") { counter++; }
                    else { break; }
                }
            }
            return counter;
        }
	}
}